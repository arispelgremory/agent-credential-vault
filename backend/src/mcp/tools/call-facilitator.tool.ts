/**
 * Call Facilitator Tool
 * Calls the x402 facilitator to verify or settle payments
 * 
 * This tool creates an x-payment header with a base64-encoded payload and calls
 * the facilitator's verify or settle endpoints, similar to the facilitator/index.ts example.
 * 
 * @param userId - User ID to fetch credentials from database
 * @param paymentPayload - The payment payload object
 * @param paymentRequirements - The payment requirements from the server
 * @param action - Either "verify" or "settle" (defaults to "verify")
 * @returns MCP tool response with facilitator response
 */
import axios from 'axios';
import { CredentialRepository } from '@/features/credential/credential.repository.js';
import { PrivateKey } from '@hashgraph/sdk';

interface PaymentPayload {
    network: string;
    accountId: string;
    amount: string;
    token: string;
    nonce: string;
    sessionId: string;
    metadata: {
        agentId?: string;
        purpose?: string;
        [key: string]: any;
    };
    signature: string;
}

interface PaymentRequirements {
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description?: string;
    mimeType?: string;
    payTo: string;
    maxTimeoutSeconds?: number;
    asset?: string | null;
    outputSchema?: any;
    extra?: {
        feePayer?: string;
        x402Version?: number;
        price?: string;
        [key: string]: any;
    };
}

/**
 * Sign a message using Hedera private key
 */
async function signMessage(message: string, privateKey: string): Promise<string> {
    try {
        const key = PrivateKey.fromString(privateKey);
        const messageBytes = Buffer.from(message, 'utf-8');
        const signature = key.sign(messageBytes);
        // Return signature as hex string
        return '0x' + Buffer.from(signature).toString('hex');
    } catch (error) {
        throw new Error(`Failed to sign message: ${error}`);
    }
}

export async function callFacilitatorTool({
    userId,
    paymentPayload,
    paymentRequirements,
    action = 'verify'
}: {
    userId: string;
    paymentPayload: PaymentPayload;
    paymentRequirements: PaymentRequirements;
    action?: 'verify' | 'settle';
}) {
    if (!userId) {
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "User ID is required",
                    message: "userId parameter is required to fetch credentials from database"
                }, null, 2)
            }]
        };
    }

    try {
        // Get user credentials from database
        const credentialRepo = new CredentialRepository();
        const credentials = await credentialRepo.getDecryptedCredentialByUserId(userId);

        if (!credentials) {
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        success: false,
                        error: "Credentials not found",
                        message: `No Hedera credentials found in database for user from call-facilitator tool ${userId}`
                    }, null, 2)
                }]
            };
        }

        // Normalize network name
        const normalizedNetwork = credentials.network === 'testnet' || credentials.network === 'hedera-testnet' 
            ? 'hedera-testnet' 
            : credentials.network === 'mainnet' || credentials.network === 'hedera-mainnet'
            ? 'hedera-mainnet'
            : credentials.network === 'previewnet' || credentials.network === 'hedera-previewnet'
            ? 'hedera-previewnet'
            : credentials.network;

        // Ensure payment payload has correct account ID and network
        const payload: PaymentPayload = {
            ...paymentPayload,
            network: normalizedNetwork,
            accountId: credentials.operatorAccountId,
        };

        // Create message to sign (exclude signature from the message being signed)
        const { signature: _, ...payloadWithoutSignature } = payload;
        const messageToSign = JSON.stringify(payloadWithoutSignature);
        
        // Sign the payload if signature is not provided or needs to be regenerated
        let finalSignature = payload.signature;
        if (!finalSignature || finalSignature === '0x' || finalSignature === '') {
            finalSignature = await signMessage(messageToSign, credentials.privateKey);
        }

        // Add signature to payload
        const signedPayload: PaymentPayload = {
            ...payload,
            signature: finalSignature
        };

        // Encode payload as base64 for x-payment header
        const payloadJson = JSON.stringify(signedPayload);
        const payloadBase64 = Buffer.from(payloadJson, 'utf-8').toString('base64');

        // Get facilitator URL (default to localhost if running facilitator server ourselves)
        const facilitatorUrl = process.env.X402_FACILITATOR_URL || 
                              process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 
                              'http://localhost:3001'; // Default to local facilitator server

        // Call facilitator endpoint (verify or settle)
        const endpoint = action === 'settle' ? '/settle' : '/verify';
        const facilitatorEndpoint = `${facilitatorUrl}${endpoint}`;

        console.log(`Calling facilitator ${endpoint} with x-payment header`);
        console.log('Payment payload:', signedPayload);
        console.log('Payment requirements:', paymentRequirements);

        

        // Make request to facilitator with x-payment header
        const response = await axios.post(
            facilitatorEndpoint,
            {
                paymentPayload: signedPayload,
                paymentRequirements: paymentRequirements
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-PAYMENT': payloadBase64, // Base64 encoded payment payload
                }
            }
        );

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: true,
                    action: action,
                    facilitatorResponse: response.data,
                    httpStatus: response.status,
                    paymentPayload: signedPayload,
                    xPaymentHeader: payloadBase64,
                    message: `Facilitator ${action} completed successfully`
                }, null, 2)
            }]
        };
    } catch (error: any) {
        console.error('Error calling facilitator:', error);
        
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "Facilitator call failed",
                    message: error.message || 'Unknown error',
                    details: error.response?.data || error.toString(),
                    action: action
                }, null, 2)
            }]
        };
    }
}

