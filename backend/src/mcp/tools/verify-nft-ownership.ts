import { MirrorNodeService } from "../../features/hedera/mirror-node/mirror-node.service.js";

/**
 * Verify NFT Ownership Tool
 * Verifies if a specific NFT (token) belongs to a Hedera account
 * 
 * This tool queries the Hedera mirror node to check if an NFT is owned by the specified account.
 * 
 * @param accountId - The Hedera account ID to check (e.g., "0.0.123456")
 * @param tokenId - The NFT token ID to verify (e.g., "0.0.789012")
 * @param serialNumber - Optional: Specific serial number of the NFT to check. If not provided, checks all NFTs of the token owned by the account.
 * @returns MCP tool response with NFT details if found, or "not found" message if the NFT doesn't belong to the account
 */
export async function verifyNftOwnershipTool({
    accountId,
    tokenId,
    serialNumber
}: {
    accountId: string;
    tokenId: string;
    serialNumber?: number;
}) {
    if (!accountId) {
        throw new Error("Account ID is required");
    }
    
    if (!tokenId) {
        throw new Error("Token ID is required");
    }

    console.log("Verifying NFT ownership - accountId:", accountId);
    console.log("Verifying NFT ownership - tokenId:", tokenId);
    if (serialNumber !== undefined) {
        console.log("Verifying NFT ownership - serialNumber:", serialNumber);
    }

    const mirrorNodeService = new MirrorNodeService();

    try {
        // Query NFTs for the account and token
        // If serialNumber is provided, filter by it
        const result = await mirrorNodeService.getTokenNFTs(
            tokenId,
            accountId,
            1000, // limit
            'asc',
            serialNumber
        );

        const nfts = result.nfts || [];

        // If no NFTs found, return not found
        if (nfts.length === 0) {
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        success: false,
                        found: false,
                        accountId: accountId,
                        tokenId: tokenId,
                        serialNumber: serialNumber || "any",
                        message: serialNumber 
                            ? `NFT with token ID ${tokenId} and serial number ${serialNumber} not found for account ${accountId}`
                            : `No NFTs with token ID ${tokenId} found for account ${accountId}`,
                        nftDetails: null
                    }, null, 2)
                }]
            };
        }

        // If serialNumber was specified, check if we found the exact one
        if (serialNumber !== undefined) {
            const nft = nfts.find(n => n.serial_number === serialNumber);
            
            if (!nft) {
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: false,
                            found: false,
                            accountId: accountId,
                            tokenId: tokenId,
                            serialNumber: serialNumber,
                            message: `NFT with token ID ${tokenId} and serial number ${serialNumber} not found for account ${accountId}`,
                            nftDetails: null
                        }, null, 2)
                    }]
                };
            }

            // Found the specific NFT
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        success: true,
                        found: true,
                        accountId: accountId,
                        tokenId: tokenId,
                        serialNumber: serialNumber,
                        message: `NFT verified: Account ${accountId} owns NFT ${tokenId}#${serialNumber}`,
                        nftDetails: {
                            tokenId: nft.token_id,
                            serialNumber: nft.serial_number,
                            accountId: nft.account_id,
                            metadata: nft.metadata,
                            createdTimestamp: nft.created_timestamp,
                            modifiedTimestamp: nft.modified_timestamp,
                            deleted: nft.deleted,
                            spender: nft.spender,
                            delegatingSpender: nft.delegating_spender
                        }
                    }, null, 2)
                }]
            };
        }

        // If no serialNumber specified, return all NFTs of this token owned by the account
        const nftDetails = nfts.map(nft => ({
            tokenId: nft.token_id,
            serialNumber: nft.serial_number,
            accountId: nft.account_id,
            metadata: nft.metadata,
            createdTimestamp: nft.created_timestamp,
            modifiedTimestamp: nft.modified_timestamp,
            deleted: nft.deleted,
            spender: nft.spender,
            delegatingSpender: nft.delegating_spender
        }));

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    success: true,
                    found: true,
                    accountId: accountId,
                    tokenId: tokenId,
                    serialNumber: "all",
                    message: `Found ${nfts.length} NFT(s) with token ID ${tokenId} owned by account ${accountId}`,
                    count: nfts.length,
                    nftDetails: nftDetails
                }, null, 2)
            }]
        };

    } catch (error: any) {
        console.error("Error verifying NFT ownership:", error);
        
        // Check if it's a "not found" type error
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        success: false,
                        found: false,
                        accountId: accountId,
                        tokenId: tokenId,
                        serialNumber: serialNumber || "any",
                        message: `NFT not found: ${error.message}`,
                        nftDetails: null
                    }, null, 2)
                }]
            };
        }

        throw new Error(`Failed to verify NFT ownership: ${error.message}`);
    }
}
