/**
 * Process x402 Payment Flow Tool
 * Complete x402 payment flow: Get requirements → Transfer HBAR → Verify/Settle with facilitator
 * 
 * This tool orchestrates the complete x402 payment flow:
 * 1. Gets payment requirements (or uses provided ones)
 * 2. Transfers HBAR from user account to system account
 * 3. Creates payment payload from transaction
 * 4. Calls facilitator to verify/settle
 * 5. Returns complete transaction info to client
 * 
 * @param userId - User ID to fetch credentials from database
 * @param paymentRequirements - Optional payment requirements (if not provided, will fetch)
 * @param action - Either "verify" or "settle" (defaults to "verify")
 * @returns MCP tool response with complete payment flow result
 */
import { CredentialRepository } from '@/features/credential/credential.repository.js';
import { transferHbarPaymentTool } from './transfer-hbar-payment.tool.js';
import { callFacilitatorTool } from './call-facilitator.tool.js';
import { getPaymentRequirementsTool } from './transfer-hbar-payment.tool.js';

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

export async function processX402PaymentFlowTool({
    userId,
    paymentRequirements,
    action = 'verify'
}: {
    userId: string;
    paymentRequirements?: PaymentRequirements;
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
        // Step 1: Get payment requirements if not provided
        let requirements = paymentRequirements;

        if (!requirements) {
            throw new Error('Payment requirements are required');
        }

        // Step 2: Parse payment requirements to get amount and recipient
        const amountInTinybars = parseInt(requirements.maxAmountRequired || '100000', 10);
        const amountInHbar = amountInTinybars / 100_000_000; // Convert tinybars to HBAR
        const recipientAccountId = requirements.payTo;

        console.log('Payment Flow - Step 1: Requirements parsed');
        console.log(`  Amount: ${amountInHbar} HBAR (${amountInTinybars} tinybars)`);
        console.log(`  Recipient: ${recipientAccountId}`);
        console.log(`  Network: ${requirements.network}`);

        // Step 3: Transfer HBAR payment
        console.log('Payment Flow - Step 2: Transferring HBAR...');
        const transferResult = await transferHbarPaymentTool({
            recipientAccountId,
            amount: amountInHbar,
            userId:userId
        });
        let transferData: any = null;
        if (transferResult.content?.[0]?.text) {
            try {
                transferData = JSON.parse(transferResult.content[0].text);
            } catch (e) {
                throw new Error(`Failed to parse transfer result: ${e}`);
            }
        }

        if (!transferData || !transferData.success) {
            throw new Error(transferData?.message || 'HBAR transfer failed');
        }

        console.log('Payment Flow - Step 2: HBAR transfer completed');
        console.log(`  Transaction ID: ${transferData.transactionId}`);
        console.log(`  Status: ${transferData.status}`);

        // Step 4: Create payment payload from transaction
        const nonce = Date.now().toString();
        const sessionId = `0x${Math.random().toString(16).substring(2)}`;
        
        const paymentPayload = {
            network: requirements.network || 'hedera-testnet',
            accountId: userId, // Will be filled by backend from credentials
            amount: amountInTinybars.toString(),
            token: 'HBAR',
            nonce: nonce,
            sessionId: sessionId,
            metadata: {
                agentId: '0x01',
                purpose: 'live-chat',
                transactionId: transferData.transactionId
            },
            signature: userId
        };

        console.log('Payment Flow - Step 3: Created payment payload');
        console.log(`  Transaction ID: ${transferData.transactionId}`);

        // Step 5: Call facilitator to verify payment transaction
        console.log('Payment Flow - Step 4: Verifying payment transaction...');
        const verifyResult = await callFacilitatorTool({
            userId: userId,
            paymentPayload,
            paymentRequirements: requirements,
            action: 'verify' // Always verify first
        });

        let verifyData: any = null;
        if (verifyResult.content?.[0]?.text) {
            try {
                verifyData = JSON.parse(verifyResult.content[0].text);
            } catch (e) {
                throw new Error(`Failed to parse verify result: ${e}`);
            }
        }

        if (!verifyData || !verifyData.success || !verifyData.facilitatorResponse?.valid) {
            const errorMsg = verifyData?.facilitatorResponse?.error || verifyData?.message || 'Payment verification failed';
            throw new Error(`Payment verification failed: ${errorMsg}`);
        }

        console.log('Payment Flow - Step 4: Payment verified');
        console.log(`  Transaction ID: ${verifyData.facilitatorResponse?.transactionId}`);
        console.log(`  Status: ${verifyData.facilitatorResponse?.status}`);
        console.log(`  Valid: ${verifyData.facilitatorResponse?.valid}`);

        // Step 6: Automatically settle the payment after verification
        console.log('Payment Flow - Step 5: Settling payment...');
        const settleResult = await callFacilitatorTool({
            userId: userId,
            paymentPayload,
            paymentRequirements: requirements,
            action: 'settle' // Automatically settle after verify
        });

        let settleData: any = null;
        if (settleResult.content?.[0]?.text) {
            try {
                settleData = JSON.parse(settleResult.content[0].text);
            } catch (e) {
                throw new Error(`Failed to parse settle result: ${e}`);
            }
        }

        if (!settleData || !settleData.success || !settleData.facilitatorResponse?.success) {
            const errorMsg = settleData?.facilitatorResponse?.error || settleData?.message || 'Payment settlement failed';
            throw new Error(`Payment settlement failed: ${errorMsg}`);
        }

        console.log('Payment Flow - Step 5: Payment settled');
        console.log(`  Settlement Status: ${settleData.facilitatorResponse?.success ? 'PASSED' : 'FAILED'}`);
        console.log(`  Transaction ID: ${settleData.facilitatorResponse?.transactionId}`);

        // Step 7: Return complete result with verification and settlement proof
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: true,
                    message: 'Complete x402 payment flow completed successfully',
                    flow: {
                        step1: 'Get payment requirements',
                        step2: 'Transfer HBAR payment',
                        step3: 'Create payment payload',
                        step4: 'Verify payment transaction on Hedera',
                        step5: 'Settle payment'
                    },
                    transaction: {
                        transactionId: transferData.transactionId,
                        status: transferData.status,
                        from: transferData.from,
                        to: transferData.to,
                        amount: transferData.amount,
                        network: transferData.network,
                        timestamp: transferData.paymentResponse?.timestamp || new Date().toISOString()
                    },
                    verification: {
                        valid: verifyData.facilitatorResponse?.valid || false,
                        transactionId: verifyData.facilitatorResponse?.transactionId,
                        status: verifyData.facilitatorResponse?.status,
                        proof: verifyData.facilitatorResponse?.proof,
                        error: verifyData.facilitatorResponse?.error
                    },
                    settlement: {
                        success: settleData.facilitatorResponse?.success || false,
                        transactionId: settleData.facilitatorResponse?.transactionId,
                        status: settleData.facilitatorResponse?.status,
                        message: settleData.facilitatorResponse?.message,
                        proof: settleData.facilitatorResponse?.proof,
                        error: settleData.facilitatorResponse?.error,
                        result: settleData.facilitatorResponse?.success ? 'PASSED' : 'FAILED'
                    },
                    paymentRequirements: requirements,
                    paymentPayload: settleData.paymentPayload
                }, null, 2)
            }]
        };
    } catch (error: any) {
        console.error('Error in x402 payment flow:', error);
        
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "Payment flow failed",
                    message: error.message || 'Unknown error',
                    details: error.toString()
                }, null, 2)
            }]
        };
    }
}

