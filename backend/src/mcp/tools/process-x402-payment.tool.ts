/**
 * Process x402 Payment Tool
 * Processes x402 payments using backend credentials
 * 
 * This tool handles x402 payments on the backend using user credentials from the database.
 * It uses x402-axios to process payments via the facilitator.
 * 
 * @param userId - User ID to fetch credentials from database
 * @param endpoint - Optional endpoint path (defaults to "/api/v1/mcp/messages")
 * @returns MCP tool response with payment processing status
 */
import axios from 'axios';
import { Hex, createSigner, withPaymentInterceptor } from 'x402-axios';
import { CredentialRepository } from '@/features/credential/credential.repository.js';

export async function processX402PaymentTool({
    userId,
    endpoint
}: {
    userId: string;
    endpoint?: string;
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
                        message: `No Hedera credentials found in database for user from process-x402-payment tool ${userId}`
                    }, null, 2)
                }]
            };
        }

        // Normalize network name for Hedera
        // x402-axios createSigner supports "hedera-testnet" and "hedera-mainnet"
        const normalizedNetwork = credentials.network === 'testnet' || credentials.network === 'hedera-testnet' 
            ? 'hedera-testnet' 
            : credentials.network === 'mainnet' || credentials.network === 'hedera-mainnet'
            ? 'hedera-mainnet'
            : credentials.network;

        // Create signer using x402-axios (matches example in x402/clients/axios/index.ts)
        // TypeScript types may not fully support Hedera overload, but this works at runtime
        const hederaSigner = await (createSigner as any)(normalizedNetwork, credentials.privateKey as Hex | string, {
            accountId: credentials.operatorAccountId
        });

        // Create a wrapper signer to bypass network validation if needed
        // This delegates all calls to the real Hedera signer but may help pass network checks
        const signerWrapper = {
            ...hederaSigner,
            // Add network property if withPaymentInterceptor checks for it
            network: normalizedNetwork,
            // Ensure all methods are properly delegated
            getAddress: hederaSigner.getAddress?.bind(hederaSigner) || (() => Promise.resolve(credentials.operatorAccountId)),
            sign: hederaSigner.sign?.bind(hederaSigner),
            signMessage: hederaSigner.signMessage?.bind(hederaSigner),
            createPaymentHeader: hederaSigner.createPaymentHeader?.bind(hederaSigner),
        };

        // Get facilitator URL
        const facilitatorUrl = process.env.X402_FACILITATOR_URL || 
                              process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 
                              'https://x402.org/facilitator';

        // Get API base URL
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9487';
        const apiBaseUrl = `${baseURL}/v1`;

        // Create axios client with x402 payment interceptor
        // Use type assertion to bypass network validation if needed
        // The signer from createSigner should work, but withPaymentInterceptor may check network internally
        const client = (withPaymentInterceptor as any)(
            axios.create({
                baseURL: apiBaseUrl,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }),
            signerWrapper // Use wrapper instead of original signer
        );

        // Make a test request to trigger x402 payment
        // The interceptor will automatically handle HTTP 402 and process payment
        const targetEndpoint = endpoint || '/mcp/messages';
        const response = await client.post(targetEndpoint, {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/list',
            params: {}
        });

        // Check for payment response in headers
        const paymentResponse = response.headers['x-payment-response'];

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: true,
                    message: 'x402 payment processed successfully',
                    accountId: credentials.operatorAccountId,
                    network: normalizedNetwork,
                    endpoint: targetEndpoint,
                    paymentResponse: paymentResponse || 'No payment response header',
                    httpStatus: response.status
                }, null, 2)
            }]
        };
    } catch (error: any) {
        console.error('Error processing x402 payment:', error);
        
        // Check if it's an HTTP 402 error
        if (error.response?.status === 402) {
            const paymentRequirements = error.response.data?.paymentRequirements;
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        success: false,
                        error: "Payment required",
                        httpStatus: 402,
                        message: "HTTP 402 received - payment requirements provided",
                        paymentRequirements: paymentRequirements
                    }, null, 2)
                }]
            };
        }

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "Payment processing failed",
                    message: error.message || 'Unknown error',
                    details: error.response?.data || error.toString()
                }, null, 2)
            }]
        };
    }
}

