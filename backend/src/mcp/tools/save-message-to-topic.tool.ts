/**
 * Save Message to Topic Tool
 * Saves conversation messages (inbound/outbound) to a Hedera topic
 * 
 * This tool is registered in the MCP server at src/mcp/server.ts
 * 
 * Message structure:
 * - Inbound: { type: 'inbound', sender: string, timestamp: string, text: string }
 * - Outbound: { type: 'outbound', sender: 'assistant', timestamp: string, text: string }
 * 
 * @param topicId - The Hedera topic ID to save messages to
 * @param messages - Array of message objects to save
 * @param userId - User ID to fetch credentials from database
 * @returns MCP tool response with transaction information
 */
import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { HederaMcpConfig } from "../config/hedera-mcp.config.js";
import { CredentialRepository } from "@/features/credential/credential.repository.js";
import { uploadJsonToIpfs } from "@/util/ipfs-upload.js";

interface Message {
    type: 'inbound' | 'outbound';
    sender: string;
    timestamp: string;
    text: string;
}

export async function saveMessageToTopicTool({
    topicId,
    messages,
    userId
}: {
    topicId: string;
    messages: Message[];
    userId: string;
}) {
    if (!topicId) {
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "Topic ID is required",
                    message: "topicId parameter is required"
                }, null, 2)
            }]
        };
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "Messages array is required",
                    message: "messages parameter must be a non-empty array"
                }, null, 2)
            }]
        };
    }

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
            throw new Error('No Hedera credentials found in database for this user. Please add credentials via the credential API.');
        }

        // Get Hedera client for user
        const hederaClient = HederaMcpConfig.getClientForUser(
            credentials.operatorAccountId,
            credentials.privateKey,
            credentials.network,
            userId
        );

        // Prepare message payload
        const messagePayload = {
            messages: messages.map(msg => ({
                type: msg.type,
                sender: msg.sender,
                timestamp: msg.timestamp,
                text: msg.text
            })),
            savedAt: new Date().toISOString(),
            userId: userId,
            topicId: topicId
        };

        // Upload message payload to IPFS (using Pinata if credentials are available)
        console.log('Uploading messages to IPFS...');
        const ipfsHash = await uploadJsonToIpfs(messagePayload);
        console.log('Messages uploaded to IPFS:', ipfsHash);

        // Create and execute transaction - send IPFS hash to topic
        const transaction = new TopicMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(ipfsHash);

        const txResponse = await transaction.execute(hederaClient);
        const receipt = await txResponse.getReceipt(hederaClient);

        console.log("Message saved to topic:", {
            topicId,
            transactionId: txResponse.transactionId.toString(),
            status: receipt.status.toString(),
            messageCount: messages.length
        });

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: true,
                    message: `Successfully saved ${messages.length} message(s) to topic ${topicId}`,
                    transaction: {
                        transactionId: txResponse.transactionId.toString(),
                        status: receipt.status.toString(),
                        topicId: topicId,
                        topicSequenceNumber: receipt.topicSequenceNumber?.toString()
                    },
                    ipfsHash: ipfsHash,
                    messagesSaved: messages.length,
                    messageTypes: {
                        inbound: messages.filter(m => m.type === 'inbound').length,
                        outbound: messages.filter(m => m.type === 'outbound').length
                    }
                }, null, 2)
            }]
        };
    } catch (error: any) {
        console.error('Error saving message to topic:', error);
        
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: false,
                    error: "Failed to save message to topic",
                    message: error.message || 'Unknown error',
                    details: error.toString()
                }, null, 2)
            }]
        };
    }
}

