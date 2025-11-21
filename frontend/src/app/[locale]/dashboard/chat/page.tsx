'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/constants/axios-v1'
import { env } from '@/env/env'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, PlusCircle, Clock, RefreshCw, Flame, Key, Lock, Network, X, AlertCircle, DollarSign, Trash2, Send, Bot, User, Wallet, ArrowRightLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMutation, useQueryClient, useQuery, dataTagErrorSymbol } from '@tanstack/react-query'
// x402 payment handling is now done via MCP tools on the backend

type McpResult = {
  mcpId: string;
  agentId: string;
  agentIdOnChain: string;
  name: string;
  description: string;
  endpoints: string[];
  capabilities: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

// Default system prompt with Hedera MCP tools information (optimized for speed)
const DEFAULT_HEDERA_SYSTEM_PROMPT =  `You are a helpful assistant that can interact with Hedera blockchain through MCP (Model Context Protocol) tools.

IMPORTANT: Before performing any Hedera operations, you must check if the user has set up their credentials. If the user has no credentials or credentials are not active, you MUST inform them that they need to set up their Hedera credentials first. Direct them to use the "View Credentials" button to add their Hedera account ID and private key.

Available Hedera MCP Tools:
1. check-balance: Check the balance of a Hedera account
   - Usage: "Check my wallet balance" or "Check balance for account 0.0.12345"
   - Parameters: accountId (optional, will use default if not provided)
   - NOTE: Requires active credentials. If no credentials are available, inform the user to set up credentials first.
   - IMPORTANT: When responding to check-balance results, format as: "Your Hedera account balance is [X] HBAR ([Y] tinybars)". NEVER use dollar signs ($) or currency symbols. Only show HBAR and tinybars amounts.

2. create-wallet: Create a new Hedera account/wallet
   - Usage: "Create a new wallet" or "Create wallet"
   - No parameters needed
   - NOTE: Requires active credentials. If no credentials are available, inform the user to set up credentials first.

3. build-transaction: Build and send a transfer transaction (automatically signs and executes)
   - Usage: "Build transaction from 0.0.12345 to 0.0.67890 for 10 HBAR"
   - Parameters: senderAccountId, recipientAccountId, amount (in HBAR)
   - Note: This tool automatically signs and sends the transaction
   - NOTE: Requires active credentials. If no credentials are available, inform the user to set up credentials first.
   - IMPORTANT: When responding to build-transaction results, keep it VERY SIMPLE. Only say:
     "Transaction sent successfully! Transaction ID: [transactionId]. View on HashScan: [hashscan-link]"
     Do NOT show detailed JSON, do NOT list steps, do NOT explain the process. Just confirm it was sent with the transaction ID and link.

4. send-transaction: Send a signed transaction
   - Usage: "Send transaction [signed transaction data]"
   - Parameters: signedTransaction
   - NOTE: Requires active credentials. If no credentials are available, inform the user to set up credentials first.

When the user asks to perform any of these actions:
1. First check if credentials are available. If not, politely inform them: "I'd be happy to help with that Hedera operation! However, I notice you haven't set up your Hedera credentials yet. Please click the 'View Credentials' button to add your Hedera account ID and private key. Once your credentials are set up, I'll be able to help you with Hedera operations."
2. If credentials are available, acknowledge their request and indicate that the tool will be called. The system will automatically call the appropriate MCP tool based on the user's request.

For example:
- User: "Check my hedera wallet balance" (with no credentials)
- You: "I'd be happy to check your Hedera wallet balance! However, I notice you haven't set up your Hedera credentials yet. Please click the 'View Credentials' button to add your Hedera account ID and private key. Once your credentials are set up, I'll be able to check your balance for you."

- User: "Check my hedera wallet balance" (with credentials)
- You: "I'll check your Hedera wallet balance for you. Let me call the check-balance tool..."
- [System calls the tool and provides the result]
- You: [Provide a helpful response based on the tool result]`;

export default function Home() {
  // Create API client that works with or without AuthProvider
  // This client will use tokens from storage if available
  const apiClient = useMemo(() => {
    return createClient({
      onRefreshFail: () => {
        console.warn('Token refresh failed');
      },
    });
  }, []);
  
  const [activeTab, setActiveTab] = useState("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Fetch credentials from API - always enabled to check if user has credentials
  const { data: credentialsData, isLoading: isLoadingCredentials, error: credentialsFetchError } = useQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      const response = await apiClient.get('/credential');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch credentials');
    },
    retry: false,
  });
  
  // Transform API response to match the expected format
  const credentials = credentialsData ? [{
    id: credentialsData.credentialId,
    name: `Hedera ${credentialsData.credentialType || 'Credential'}`,
    description: `Hedera credential for ${credentialsData.credentialType || 'blockchain'} operations`,
    agentId: 'default',
    tokenId: credentialsData.credentialId,
    isActive: credentialsData.status === 'ACTIVE',
    permissions: ['hedera:read', 'hedera:write'],
    issuanceDate: credentialsData.createdAt,
    expirationDate: null,
    credentialType: credentialsData.credentialType,
    // Store the credential data (includes operatorAccountId, privateKey, network)
    credentialData: credentialsData.credentialData || {},
    userId: credentialsData.userId,
  }] : []
  
  // Credential form state
  const [operatorAccountId, setOperatorAccountId] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [network, setNetwork] = useState('testnet')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [credentialError, setCredentialError] = useState<string | null>(null)
  const [credentialSuccess, setCredentialSuccess] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  
  // Create a reference to the worker object.
  const worker = useRef<Worker | null>(null);

  // Keep track of the classification result and the model loading status.
  const [result, setResult] = useState<any>(null);
  const [ready, setReady] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [mcps, setMcps] = useState<McpResult[]>([]);
  const [selectedMcp, setSelectedMcp] = useState<McpResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [callResult, setCallResult] = useState<any>(null);
  
  // Granite AI state
  const [graniteResult, setGraniteResult] = useState<string>('');
  const [granitePrompt, setGranitePrompt] = useState<string>('');
  const [graniteSystemPrompt, setGraniteSystemPrompt] = useState<string>(DEFAULT_HEDERA_SYSTEM_PROMPT);
  const [graniteLoading, setGraniteLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  // Chat messages for UI display
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, id: string}>>([]);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  // x402 payment is now handled via MCP tools on backend - no client needed
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [paymentAmount] = useState<number>(0.001); // Fixed payment amount in HBAR
  
  // Limit conversation history to last 6 messages (3 exchanges) to improve performance
  const MAX_CONVERSATION_HISTORY = 6;

  // Message buffering for Hedera topic saving
  const [inboundMessages, setInboundMessages] = useState<Array<{type: 'inbound', sender: string, timestamp: string, text: string}>>([]);
  const [outboundMessages, setOutboundMessages] = useState<Array<{type: 'outbound', sender: string, timestamp: string, text: string}>>([]);
  const [savingMessages, setSavingMessages] = useState<boolean>(false);
  const [conversationEnded, setConversationEnded] = useState<boolean>(false);
  
  // Get topic IDs from environment variables
  const inboundTopicId = env.NEXT_PUBLIC_INBOUND_TOPIC_ID || '';
  const outboundTopicId = env.NEXT_PUBLIC_OUTBOUND_TOPIC_ID || '';

  // Auto-end conversation timer (30 seconds for testing, 5 minutes for production)
  const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 30 seconds for dev, 5 minutes for prod
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user has active credentials
  const hasActiveCredentials = useMemo(() => {
    return credentials.length > 0 && credentials.some(c => c.isActive && c.credentialType === 'hedera');
  }, [credentials]);

  // Get active credential for payment
  const activeCredential = useMemo(() => {
    return credentials.find(c => c.isActive && c.credentialType === 'hedera') || null;
  }, [credentials]);

  // x402 payment is now handled via MCP tools on backend
  // No client initialization needed - backend handles everything

  // Force re-render when paymentCompleted changes to ensure UI updates
  useEffect(() => {
    if (paymentCompleted) {
      console.log('Payment completed - chat section should be visible');
    }
  }, [paymentCompleted]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Credentials filtering logic
  const filteredCredentials = credentials.filter((credential) => {
    if (activeTab === "active") return credential.isActive
    if (activeTab === "revoked") return !credential.isActive
    return true // "all" tab
  })

  // Create credential mutation
  const createCredentialMutation = useMutation({
    mutationFn: async (data: { operatorAccountId: string; privateKey: string; network?: string }) => {
      const response = await apiClient.post('/credential', data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to save credential');
    },
    onSuccess: () => {
      setCredentialSuccess('Credential saved successfully!');
      setCredentialError(null);
      // Clear form
      setOperatorAccountId('');
      setPrivateKey('');
      setNetwork('testnet');
      setShowAddForm(false);
      // Refresh credentials list
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
    onError: (err: any) => {
      setCredentialError(err.response?.data?.message || err.message || 'Failed to save credential');
      setCredentialSuccess(null);
    },
  });

  // Delete credential mutation
  const deleteCredentialMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/credential');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to delete credential');
    },
    onSuccess: () => {
      setCredentialSuccess('Credential deleted successfully!');
      setCredentialError(null);
      // Refresh credentials list
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      // Reset payment state if credential was deleted
      setPaymentCompleted(false);
    },
    onError: (err: any) => {
      setCredentialError(err.response?.data?.message || err.message || 'Failed to delete credential');
      setCredentialSuccess(null);
    },
  });

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialError(null);
    setCredentialSuccess(null);

    if (!operatorAccountId.trim() || !privateKey.trim()) {
      setCredentialError('Operator Account ID and Private Key are required');
      return;
    }

    // Validate Hedera account ID format (0.0.xxxxx)
    const accountIdPattern = /^0\.0\.\d+$/;
    if (!accountIdPattern.test(operatorAccountId.trim())) {
      setCredentialError('Invalid Hedera account ID format. Expected format: 0.0.xxxxx');
      return;
    }

    createCredentialMutation.mutate({
      operatorAccountId: operatorAccountId.trim(),
      privateKey: privateKey.trim(),
      network: network || 'testnet',
    });
  };

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      try {
        // Create the worker if it does not yet exist.
        worker.current = new Worker(new URL('./worker.js', import.meta.url), {
          type: 'module'
        });

        // Handle worker errors
        worker.current.onerror = (error) => {
          console.error("Worker error:", error);
          setReady(false);
        };

        // Handle unhandled promise rejections in worker
        worker.current.addEventListener('error', (error) => {
          console.error("Worker error event:", error);
          setReady(false);
        });
      } catch (error) {
        console.error("Failed to create worker:", error);
        setReady(false);
        return;
      }
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: MessageEvent) => {
        console.log("message received", e.data);
        switch (e.data.status) {
            case 'initiate':
                setReady(false);
                break;
            case 'ready':
                setReady(true);
                break;
            case 'streaming':
                // Update streaming text
                setIsStreaming(true);
                setGraniteResult(e.data.accumulated || '');
                // Update the last assistant message in chat
                setChatMessages(prev => {
                  const newMessages = [...prev];
                  if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                    newMessages[newMessages.length - 1] = {
                      ...newMessages[newMessages.length - 1],
                      content: e.data.accumulated || ''
                    };
                  }
                  return newMessages;
                });
                break;
            case 'complete':
                setIsStreaming(false);
                setGraniteLoading(false);
                // Set the final result
                if (e.data.output) {
                    const finalOutput = e.data.output;
                    setGraniteResult(finalOutput);
                    // Update conversation history with assistant response
                    setConversationHistory(prev => [
                      ...prev,
                      { role: 'assistant', content: finalOutput }
                    ]);
                    // Update the last assistant message in chat
                    setChatMessages(prev => {
                      const newMessages = [...prev];
                      if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                        newMessages[newMessages.length - 1] = {
                          ...newMessages[newMessages.length - 1],
                          content: finalOutput
                        };
                      }
                      return newMessages;
                    });
                    
                    // Save outbound message to buffer (from worker.js generatedContent)
                    // This is the agent response that will be saved to outbound topic
                    if (finalOutput && typeof finalOutput === 'string' && finalOutput.trim()) {
                      const outboundMessage = {
                        type: 'outbound' as const,
                        sender: 'assistant',
                        timestamp: new Date().toISOString(),
                        text: finalOutput.trim()
                      };
                      setOutboundMessages(prev => [...prev, outboundMessage]);
                    }
                } else {
                    setResult(e.data.output?.[0] || e.data.output);
                }
                break;
            case 'error':
                console.error('Worker error:', e.data.error, e.data.stack);
                setIsStreaming(false);
                setGraniteLoading(false);
                setError(`Granite AI Error: ${e.data.error}`);
                setGraniteResult(`Error: ${e.data.error}`);
                break;
        }
    };

    // Attach the callback function as an event listener.
    if (worker.current) {
      worker.current.addEventListener('message', onMessageReceived);
      
      // Preload the model immediately when worker is ready
      // This will start loading the model in the background
      setTimeout(() => {
        if (worker.current) {
          console.log('Preloading Granite AI model...');
          worker.current.postMessage({ action: 'preload' });
        }
      }, 100); // Small delay to ensure worker is fully initialized
    }

    // Define a cleanup function for when the component is unmounted.
    return () => {
      if (worker.current) {
        worker.current.removeEventListener('message', onMessageReceived);
        worker.current.terminate();
        worker.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const classify = useCallback((text: string) => {
    console.log("classify", text);
    if (worker.current) {
        console.log("posting message", text);
        worker.current.postMessage({ text });
    }
  }, []);

  // Initialize x402 session - call MCP tool to process payment on backend
  // Backend handles x402 payment using user credentials from database
  const initializeX402Session = useCallback(async (): Promise<boolean> => {
    if (!hasActiveCredentials || !activeCredential) {
      console.error('Cannot initialize x402: missing credentials');
      return false;
    }

    try {
      setPaymentProcessing(true);
      setPaymentError(null);
      
      console.log('Initializing x402 session via MCP tool...');
      
      // First, get payment requirements
      const paymentRequirementsResponse = await apiClient.post('/mcp/messages', {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'get-payment-requirements',
          arguments: {
            endpoint: '/api/v1/mcp/messages'
          }
        }
      });

      // Parse payment requirements
      let paymentRequirements: any = null;
      if (paymentRequirementsResponse.data.result?.content?.[0]?.text) {
        try {
          const parsed = JSON.parse(paymentRequirementsResponse.data.result.content[0].text);
          paymentRequirements = parsed.paymentRequirements;
          console.log('Payment requirements retrieved:', paymentRequirements);
        } catch (e) {
          console.warn('Could not parse payment requirements:', e);
        }
      }

      // Get user ID from auth endpoint
      let userId = credentials[0].userId || '';
      console.log('userId', userId);
      if (!userId) {
        setError('User ID not found');
        return false;
      }

      // Use the unified payment flow tool that handles everything:
      // 1. Get payment requirements (if not provided)
      // 2. Transfer HBAR payment
      // 3. Create payment payload from transaction
      // 4. Call facilitator to verify/settle
      // 5. Return complete transaction info
      console.log('Processing complete x402 payment flow...');
      const flowResponse = await apiClient.post('/mcp/messages', {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'process-x402-payment-flow',
          arguments: {
            userId: userId,
            paymentRequirements: paymentRequirements, // Pass the requirements we already have
            action: 'verify' // Will automatically verify then settle
          }
        }
      });

      console.log('Payment flow response:', flowResponse.data);

      // Parse flow result
      let flowResult: any = null;
      if (flowResponse.data.result?.content?.[0]?.text) {
        try {
          flowResult = JSON.parse(flowResponse.data.result.content[0].text);
          console.log('Payment flow result:', flowResult);
        } catch (e) {
          console.warn('Could not parse payment flow result:', e);
        }
      }

      if (!flowResult || !flowResult.success) {
        setError(flowResult?.message || 'Failed to process payment flow');
        return false;
      }
      
      // Mark payment as completed
      setPaymentCompleted(true);
      // Reset conversation state for new conversation
      setConversationEnded(false);
      setInboundMessages([]);
      setOutboundMessages([]);
      setPaymentError(null);
      
      // Show success message with complete flow results
      let successMessage = `✓ Complete x402 Payment Flow Completed!\n\n`;
      
      // Payment Requirements
      if (flowResult.paymentRequirements) {
        const req = flowResult.paymentRequirements;
        successMessage += `Payment Requirements:\n`;
        successMessage += `  Network: ${req.network}\n`;
        successMessage += `  Amount: ${req.extra?.price || req.maxAmountRequired} (${req.maxAmountRequired} tinybars)\n`;
        successMessage += `  Pay To: ${req.payTo}\n\n`;
      }
      
      // Transaction Info (from Hedera)
      if (flowResult.transaction) {
        const tx = flowResult.transaction;
        successMessage += `Hedera Transaction:\n`;
        successMessage += `  Transaction ID: ${tx.transactionId}\n`;
        successMessage += `  Status: ${tx.status}\n`;
        successMessage += `  From: ${tx.from}\n`;
        successMessage += `  To: ${tx.to}\n`;
        successMessage += `  Amount: ${tx.amount}\n`;
        successMessage += `  Network: ${tx.network}\n`;
        successMessage += `  Timestamp: ${tx.timestamp}\n\n`;
      }
      
      // Verification Result
      if (flowResult.verification) {
        const ver = flowResult.verification;
        successMessage += `Payment Verification:\n`;
        successMessage += `  Status: ${ver.valid ? '✓ VALID' : '✗ INVALID'}\n`;
        successMessage += `  Transaction ID: ${ver.transactionId || 'N/A'}\n`;
        successMessage += `  Transaction Status: ${ver.status || 'N/A'}\n`;
        if (ver.proof) {
          successMessage += `  Proof:\n`;
          successMessage += `    - Transaction ID: ${ver.proof.transactionId}\n`;
          successMessage += `    - Status: ${ver.proof.status}\n`;
          successMessage += `    - Network: ${ver.proof.network}\n`;
          successMessage += `    - Timestamp: ${ver.proof.timestamp}\n`;
        }
        if (ver.error) {
          successMessage += `  Error: ${ver.error}\n`;
        }
        successMessage += `\n`;
      }
      
      // Settlement Result
      if (flowResult.settlement) {
        const set = flowResult.settlement;
        successMessage += `Payment Settlement:\n`;
        successMessage += `  Result: ${set.result || (set.success ? 'PASSED' : 'FAILED')}\n`;
        successMessage += `  Success: ${set.success ? '✓ YES' : '✗ NO'}\n`;
        successMessage += `  Transaction ID: ${set.transactionId || 'N/A'}\n`;
        successMessage += `  Status: ${set.status || 'N/A'}\n`;
        successMessage += `  Message: ${set.message || 'N/A'}\n`;
        if (set.proof) {
          successMessage += `  Proof:\n`;
          successMessage += `    - Transaction ID: ${set.proof.transactionId}\n`;
          successMessage += `    - Status: ${set.proof.status}\n`;
          successMessage += `    - Network: ${set.proof.network}\n`;
          successMessage += `    - Timestamp: ${set.proof.timestamp}\n`;
        }
        if (set.error) {
          successMessage += `  Error: ${set.error}\n`;
        }
        successMessage += `\n`;
      }
      
      successMessage += `✓ Payment Flow Steps Completed:\n`;
      successMessage += `  1. ✓ Get payment requirements\n`;
      successMessage += `  2. ✓ Transfer HBAR payment\n`;
      successMessage += `  3. ✓ Create payment payload\n`;
      successMessage += `  4. ✓ Verify payment transaction on Hedera\n`;
      successMessage += `  5. ✓ Settle payment\n\n`;
      successMessage += `You can now start chatting!`;
      
      setGraniteResult(successMessage);
      // Add welcome message to chat
      setChatMessages([{
        role: 'assistant',
        content: successMessage,
        id: `msg-${Date.now()}`
      }]);
      
      return true;
    } catch (error: any) {
      console.error('x402 session initialization failed:', error);
      
      const errorMessage = error.response?.data?.error?.message || 
                         error.response?.data?.error?.data || 
                         error.response?.data?.message || 
                         error.message || 
                         'Unknown error';
      setPaymentError(`x402 initialization failed: ${errorMessage}`);
      setError(`Payment failed: ${errorMessage}`);
      return false;
    } finally {
      setPaymentProcessing(false);
    }
  }, [hasActiveCredentials, activeCredential, apiClient, paymentAmount]);

  // Save messages to Hedera topics when "End conversation" is clicked
  const endConversationAndSave = useCallback(async () => {
    if (!hasActiveCredentials || !activeCredential) {
      setError('Cannot save messages: missing credentials');
      return;
    }

    const userId = credentialsData?.userId || '';
    if (!userId) {
      setError('User ID not found');
      return;
    }

    if (inboundMessages.length === 0 && outboundMessages.length === 0) {
      setError('No messages to save');
      return;
    }

    let saveError = false;
    const inboundCount = inboundMessages.length;
    const outboundCount = outboundMessages.length;
    let inboundIpfsHash = '';
    let outboundIpfsHash = '';

    try {
      setSavingMessages(true);
      setError(null);

      // Save inbound messages to inbound topic
      if (inboundMessages.length > 0 && inboundTopicId) {
        try {
          console.log(`Saving ${inboundMessages.length} inbound message(s) to topic ${inboundTopicId}...`);
          const response = await apiClient.post('/mcp/messages', {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
              name: 'save-message-to-topic',
              arguments: {
                topicId: inboundTopicId,
                messages: inboundMessages,
                userId: userId
              }
            }
          });

          if (response.data.result?.content?.[0]?.text) {
            const result = JSON.parse(response.data.result.content[0].text);
            if (result.success) {
              console.log(`✓ Successfully saved ${result.messagesSaved} inbound message(s) to topic ${inboundTopicId}`);
              if (result.ipfsHash) {
                inboundIpfsHash = result.ipfsHash;
                console.log(`  IPFS Hash: ${inboundIpfsHash}`);
              }
            } else {
              console.error('Failed to save inbound messages:', result.message);
              setError(`Failed to save inbound messages: ${result.message}`);
              saveError = true;
            }
          }
        } catch (error: any) {
          console.error('Error saving inbound messages to topic:', error);
          setError(`Error saving inbound messages: ${error.message || 'Unknown error'}`);
          saveError = true;
        }
      } else if (inboundMessages.length > 0 && !inboundTopicId) {
        console.warn('Inbound messages cannot be saved: NEXT_PUBLIC_INBOUND_TOPIC_ID not set');
        setError('Inbound topic ID not configured. Please set NEXT_PUBLIC_INBOUND_TOPIC_ID in environment variables.');
        saveError = true;
      }

      // Save outbound messages to outbound topic
      if (outboundMessages.length > 0 && outboundTopicId) {
        try {
          console.log(`Saving ${outboundMessages.length} outbound message(s) to topic ${outboundTopicId}...`);
          const response = await apiClient.post('/mcp/messages', {
            jsonrpc: '2.0',
            id: Date.now() + 1,
            method: 'tools/call',
            params: {
              name: 'save-message-to-topic',
              arguments: {
                topicId: outboundTopicId,
                messages: outboundMessages,
                userId: userId
              }
            }
          });

          if (response.data.result?.content?.[0]?.text) {
            const result = JSON.parse(response.data.result.content[0].text);
            if (result.success) {
              console.log(`✓ Successfully saved ${result.messagesSaved} outbound message(s) to topic ${outboundTopicId}`);
              if (result.ipfsHash) {
                outboundIpfsHash = result.ipfsHash;
                console.log(`  IPFS Hash: ${outboundIpfsHash}`);
              }
            } else {
              console.error('Failed to save outbound messages:', result.message);
              setError(`Failed to save outbound messages: ${result.message}`);
              saveError = true;
            }
          }
        } catch (error: any) {
          console.error('Error saving outbound messages to topic:', error);
          setError(`Error saving outbound messages: ${error.message || 'Unknown error'}`);
          saveError = true;
        }
      } else if (outboundMessages.length > 0 && !outboundTopicId) {
        console.warn('Outbound messages cannot be saved: NEXT_PUBLIC_OUTBOUND_TOPIC_ID not set');
        setError('Outbound topic ID not configured. Please set NEXT_PUBLIC_OUTBOUND_TOPIC_ID in environment variables.');
        saveError = true;
      }

      // Clear message buffers and show success message only if saves succeeded
      if (!saveError) {
        setInboundMessages([]);
        setOutboundMessages([]);
        // Mark conversation as ended - disable input
        setConversationEnded(true);
        // Clear idle timer since conversation is ended
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = null;
        }
        // Generate HashScan links for validation
        const network = activeCredential?.credentialData?.network || 'testnet';
        const networkPath = network === 'mainnet' ? 'mainnet' : 'testnet';
        
        let successMsg = `Conversation has been ended.\n\n`;
        
        if (inboundTopicId && inboundCount > 0) {
          const inboundHashscanLink = `https://hashscan.io/${networkPath}/topic/${inboundTopicId}`;
          successMsg += `✓ Inbound Topic: ${inboundHashscanLink}\n`;
        }
        
        if (outboundTopicId && outboundCount > 0) {
          const outboundHashscanLink = `https://hashscan.io/${networkPath}/topic/${outboundTopicId}`;
          successMsg += `✓ Outbound Topic: ${outboundHashscanLink}`;
        }
        
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: successMsg, id: `msg-${Date.now()}` }
        ]);
      }
    } catch (error: any) {
      console.error('Error saving messages to topics:', error);
      setError(`Error saving messages: ${error.message || 'Unknown error'}`);
    } finally {
      setSavingMessages(false);
    }
  }, [inboundMessages, outboundMessages, inboundTopicId, outboundTopicId, hasActiveCredentials, activeCredential, apiClient, credentialsData]);

  // Auto-end conversation on idle timeout
  useEffect(() => {
    // Don't set timer if conversation already ended
    if (conversationEnded) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    // Only set up auto-end if payment is completed and we have messages
    if (!paymentCompleted || (inboundMessages.length === 0 && outboundMessages.length === 0)) {
      // Clear timer if no messages
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Set new timer for auto-end conversation
    console.log(`Setting auto-end conversation timer: ${IDLE_TIMEOUT_MS / 1000} seconds`);
    idleTimerRef.current = setTimeout(() => {
      console.log('Conversation idle timeout reached. Auto-ending conversation...');
      if (inboundMessages.length > 0 || outboundMessages.length > 0) {
        endConversationAndSave();
      }
    }, IDLE_TIMEOUT_MS);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [paymentCompleted, inboundMessages.length, outboundMessages.length, chatMessages.length, endConversationAndSave, IDLE_TIMEOUT_MS, conversationEnded]);

  const generateWithGranite = useCallback(async (text: string, systemPrompt?: string) => {
    console.log("generateWithGranite", text);
    
    // Add user message to chat
    const userMessageId = `msg-${Date.now()}`;
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: text, id: userMessageId }
    ]);
    // Clear input
    setGranitePrompt('');

    // Save inbound message to buffer (user message to agent)
    // The 'text' argument is the user input that will be saved to inbound topic
    const userIdentifier = credentialsData?.userId || 'user';
    const inboundMessage = {
      type: 'inbound' as const,
      sender: userIdentifier,
      timestamp: new Date().toISOString(),
      text: text.trim()
    };
    console.log('Buffering inbound message:', inboundMessage);
    setInboundMessages(prev => {
      const updated = [...prev, inboundMessage];
      console.log(`Total inbound messages in buffer: ${updated.length}`);
      return updated;
    });
    // Reset idle timer when new message is sent
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Check if credentials are available
    if (!hasActiveCredentials || !activeCredential) {
      const errorMsg = 'I\'d be happy to help with that Hedera operation! However, I notice you haven\'t set up your Hedera credentials yet. Please click the "View Credentials" button to add your Hedera account ID and private key. Once your credentials are set up, I\'ll be able to help you with Hedera operations.';
      setError('Please add and activate Hedera credentials to use MCP features. Payment is required to start conversation.');
      setGraniteResult(errorMsg);
      // Add to chat
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: errorMsg, id: `msg-${Date.now() + 1}` }
      ]);
      return;
    }

    // Check if x402 session is initialized
    if (!paymentCompleted) {
      const errorMsg = 'x402 session required. Please use the "Start Chat" button to initialize x402 payment protocol.';
      setError('Please initialize x402 session first by clicking "Start Chat" button.');
      setGraniteResult(errorMsg);
      // Add to chat
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: errorMsg, id: `msg-${Date.now() + 1}` }
      ]);
      return;
    }

    // Use regular API client - x402 is handled via MCP tools on backend
    const client = apiClient;

    if (worker.current) {
        setGraniteLoading(true);
        setIsStreaming(false);
        setError(null);
        
        // Add placeholder assistant message for streaming
        const assistantMessageId = `msg-${Date.now() + 1}`;
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: '', id: assistantMessageId }
        ]);
        
        // Check if the user's request is for a Hedera MCP tool
        const lowerText = text.toLowerCase();
        const isToolRequest = 
          lowerText.includes('check') && (lowerText.includes('balance') || lowerText.includes('wallet')) ||
          lowerText.includes('create') && lowerText.includes('wallet') ||
          lowerText.includes('build') && lowerText.includes('transaction') ||
          lowerText.includes('send') && lowerText.includes('transaction');
        
        let toolResult = null;
        let toolName = '';
        
        // If it's a tool request, call the MCP tool using x402 client
        // Don't show raw tool results to user - let Granite process and respond
        if (isToolRequest) {
          try {
            // Show a brief "processing" message while calling the tool
            setChatMessages(prev => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  content: 'Processing your request...'
                };
              }
              return newMessages;
            });
            
            const response = await client.post('/mcp/search-and-call', {
              prompt: text,
              autoCall: true,
            });
            
            if (response.data.success && response.data.data.result) {
              toolResult = response.data.data.result;
              toolName = response.data.data.toolName || 'tool';
              // Extract the actual text content from the tool result
              // Tool result format: { content: [{ type: "text", text: "..." }], text: "...", raw: {...} }
              let toolResultText = '';
              if (toolResult.text) {
                toolResultText = toolResult.text;
              } else if (toolResult.content && Array.isArray(toolResult.content)) {
                const textContent = toolResult.content.find((item: any) => item.type === 'text');
                toolResultText = textContent?.text || JSON.stringify(toolResult);
              } else {
                toolResultText = JSON.stringify(toolResult);
              }
              
              // Store tool result for Granite to process - don't show to user yet
              // The tool result will be sent to Granite, which will generate a user-friendly response
            } else {
              // Tool call failed - let Granite handle the error message
              toolResult = { error: response.data.message || 'Tool call failed' };
              toolName = 'error';
            }
          } catch (err: any) {
            console.error('MCP tool call error:', err);
            // Store error for Granite to process
            toolResult = { error: err.response?.data?.message || err.message || 'Unknown error' };
            toolName = 'error';
            setError(`Tool call failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
          }
        }
        
        // Build conversation history - limit to recent messages for performance
        const systemPromptToUse = systemPrompt || graniteSystemPrompt || DEFAULT_HEDERA_SYSTEM_PROMPT;
        const messages: Array<{role: string, content: string}> = [
          { role: 'system', content: systemPromptToUse }
        ];
        
        // Add limited conversation history (last N messages only)
        const recentHistory = conversationHistory.slice(-MAX_CONVERSATION_HISTORY);
        if (recentHistory.length > 0) {
          messages.push(...recentHistory);
        }
        
        // Add user message
        messages.push({ role: 'user', content: text });
        
        // If tool was called, add tool result for Granite to process
        // Granite will generate a user-friendly response based on the tool result
        if (toolResult !== null && toolName) {
          // Extract readable text from tool result
          let toolResultText = '';
          if (toolResult.text) {
            toolResultText = toolResult.text;
          } else if (toolResult.content && Array.isArray(toolResult.content)) {
            const textContent = toolResult.content.find((item: any) => item.type === 'text');
            toolResultText = textContent?.text || '';
          } else if (toolResult.error) {
            toolResultText = `Error: ${toolResult.error}`;
          } else {
            toolResultText = JSON.stringify(toolResult);
          }
          
          // Special handling for check-balance: clean up balance response and format properly
          if (toolName === 'check-balance' || toolName.includes('balance')) {
            try {
              // Extract balance from tool result
              // Format: "Balance for account 0.0.xxxxx: 87287747601 tinybars"
              let balanceText = toolResultText;
              
              // Remove any dollar signs that might have been added
              balanceText = balanceText.replace(/\$/g, '');
              
              // Extract the numeric value and account ID
              // Handle various formats: "Balance for account 0.0.xxxxx: 87287747601 tinybars" or "Balance for account 0.0.xxxxx: 87,287,747,601 tinybars"
              const balanceMatch = balanceText.match(/Balance for account ([\d.]+):\s*([\d,]+)\s*tinybars?/i);
              if (balanceMatch) {
                const accountId = balanceMatch[1];
                // Remove all commas and non-digit characters except digits
                const tinybarsStr = balanceMatch[2].replace(/[^\d]/g, '');
                const tinybars = BigInt(tinybarsStr); // Use BigInt for large numbers
                
                // Convert tinybars to HBAR: 1 HBAR = 100,000,000 tinybars
                const hbars = Number(tinybars) / 100_000_000;
                const hbarsFormatted = hbars.toLocaleString('en-US', { 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 8 
                });
                const tinybarsFormatted = tinybars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                
                // Create clean balance message
                const cleanBalanceText = `Balance for account ${accountId}: ${tinybarsFormatted} tinybars (${hbarsFormatted} HBAR)`;
                
                messages.push({ 
                  role: 'assistant', 
                  content: `I executed the ${toolName} tool. Result: ${cleanBalanceText}` 
                });
                messages.push({ 
                  role: 'user', 
                  content: `Respond clearly: "Your Hedera account balance is ${hbarsFormatted} HBAR (${tinybarsFormatted} tinybars)." Do NOT use dollar signs ($), do NOT show raw JSON, keep it simple and clear.` 
                });
              } else {
                // Fallback if parsing fails
                const cleanedText = balanceText.replace(/\$/g, '');
                messages.push({ 
                  role: 'assistant', 
                  content: `I executed the ${toolName} tool. Result: ${cleanedText}` 
                });
                messages.push({ 
                  role: 'user', 
                  content: `Explain this balance result clearly. Do NOT use dollar signs ($), do NOT show raw JSON. Format: "Your balance is [amount] HBAR ([amount] tinybars)."` 
                });
              }
            } catch (e) {
              // If parsing fails, use default behavior but remove dollar signs
              const cleanedText = toolResultText.replace(/\$/g, '');
              messages.push({ 
                role: 'assistant', 
                content: `I executed the ${toolName} tool. Result: ${cleanedText}` 
              });
              messages.push({ 
                role: 'user', 
                content: `Explain this balance result clearly. Do NOT use dollar signs ($), do NOT show raw JSON. Format: "Your balance is [amount] HBAR ([amount] tinybars)."` 
              });
            }
          }
          // Special handling for build-transaction: extract transactionId and create HashScan link
          else if (toolName === 'build-transaction' || toolName.includes('transaction')) {
            try {
              // Parse the JSON result to extract transactionId
              const parsedResult = typeof toolResultText === 'string' ? JSON.parse(toolResultText) : toolResultText;
              if (parsedResult.transactionId) {
                const transactionId = parsedResult.transactionId;
                // Determine network from credential (default to testnet)
                const network = activeCredential?.credentialData?.network || 'testnet';
                const networkPath = network === 'mainnet' ? 'mainnet' : 'testnet';
                const hashscanLink = `https://hashscan.io/${networkPath}/transaction/${transactionId}`;
                
                // Create simplified result for Granite
                const simplifiedResult = {
                  success: true,
                  transactionId: transactionId,
                  hashscanLink: hashscanLink
                };
                
                messages.push({ 
                  role: 'assistant', 
                  content: `I executed the ${toolName} tool. Result: ${JSON.stringify(simplifiedResult)}` 
                });
                messages.push({ 
                  role: 'user', 
                  content: `Respond VERY SIMPLY: "Transaction sent successfully! Transaction ID: ${transactionId}. View on HashScan: ${hashscanLink}" Do NOT show JSON, do NOT list steps, do NOT explain details. Just confirm it was sent with the transaction ID and link.` 
                });
              } else {
                // Fallback if transactionId not found
                messages.push({ 
                  role: 'assistant', 
                  content: `I executed the ${toolName} tool. Result: ${toolResultText}` 
                });
                messages.push({ 
                  role: 'user', 
                  content: `Please explain this result in a clear and user-friendly way for the user's request: "${text}"` 
                });
              }
            } catch (e) {
              // If parsing fails, use default behavior
              messages.push({ 
                role: 'assistant', 
                content: `I executed the ${toolName} tool. Result: ${toolResultText}` 
              });
              messages.push({ 
                role: 'user', 
                content: `Please explain this result in a clear and user-friendly way for the user's request: "${text}"` 
              });
            }
          } else {
            // For other tools, use default behavior
            messages.push({ 
              role: 'assistant', 
              content: `I executed the ${toolName} tool. Result: ${toolResultText}` 
            });
            messages.push({ 
              role: 'user', 
              content: `Please explain this result in a clear and user-friendly way for the user's request: "${text}"` 
            });
          }
        }
        
        // Update conversation history (exclude system prompt, limit size)
        const historyToSave = messages
          .filter(m => m.role !== 'system')
          .slice(-MAX_CONVERSATION_HISTORY);
        setConversationHistory(historyToSave);
        
        console.log("posting message to worker", messages);
        // Optimize generation parameters for speed
        worker.current.postMessage({ 
            messages: messages,
            max_new_tokens: 256, // Reduced from 512 for faster generation
            do_sample: false,
            temperature: 0.7, // Lower temperature for faster, more deterministic output
            top_p: 0.9,
            repetition_penalty: 1.1
        });
    }
  }, [graniteSystemPrompt, apiClient, conversationHistory, hasActiveCredentials, activeCredential, paymentCompleted, paymentAmount, credentialsData]);

  const searchMcps = useCallback(async (searchPrompt: string, autoCall: boolean = false) => {
    if (!searchPrompt.trim()) {
      setError('Please enter a search prompt');
      return;
    }

    // Check if credentials are available for operations
    if (autoCall && !hasActiveCredentials) {
      setError('Please add and activate Hedera credentials to execute MCP operations.');
      return;
    }

    setLoading(true);
    setError(null);
    setMcps([]);
    setSelectedMcp(null);
    setValidationResult(null);
    setCallResult(null);

    try {
      // Payment is handled at conversation start, so we don't need to process it here
      // Use regular API client for all operations
      const client = apiClient;
      const endpoint = autoCall ? '/mcp/search-and-call' : '/mcp/search';
      const response = await client.post(endpoint, {
        prompt: searchPrompt,
        autoCall: autoCall,
        ...(autoCall ? {} : { limit: 10 }),
      });

      if (response.data.success) {
        if (autoCall && response.data.data.result) {
          // If auto-call was used, show the result
          setCallResult(response.data.data);
        } else {
          // Regular search results
          setMcps(response.data.data.mcps || []);
          if (!response.data.data.mcps || response.data.data.mcps.length === 0) {
            setError('No MCPs found matching your prompt');
          }
        }
      } else {
        setError(response.data.message || 'Failed to search MCPs');
      }
    } catch (err: any) {
      console.error('Search MCPs error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to search MCPs');
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const validateMcp = useCallback(async (mcp: McpResult) => {
    if (!hasActiveCredentials) {
      setError('Please add and activate Hedera credentials to validate MCPs.');
      return;
    }

    setLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await apiClient.post('/mcp/validate', {
        mcpId: mcp.mcpId,
        agentId: mcp.agentId,
        validatorAddress: '0x0000000000000000000000000000000000000000', // Default validator
        intent: 'mcp-validation',
        // Private key will be retrieved from backend (from authenticated user or default env var)
      });

      if (response.data.success) {
        setValidationResult(response.data.data);
      } else {
        setError(response.data.message || 'Failed to validate MCP');
      }
    } catch (err: any) {
      console.error('Validate MCP error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to validate MCP');
    } finally {
      setLoading(false);
    }
  }, [apiClient, hasActiveCredentials]);

  const callMcp = useCallback(async (mcp: McpResult, toolName: string, args: Record<string, any> = {}) => {
    if (!hasActiveCredentials) {
      setError('Please add and activate Hedera credentials to call MCPs.');
      return;
    }

    setLoading(true);
    setError(null);
    setCallResult(null);

    try {
      const response = await apiClient.post('/mcp/call', {
        mcpId: mcp.mcpId,
        toolName,
        arguments: args,
      });

      if (response.data.success) {
        setCallResult(response.data.data);
      } else {
        setError(response.data.message || 'Failed to call MCP');
      }
    } catch (err: any) {
      console.error('Call MCP error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to call MCP');
    } finally {
      setLoading(false);
    }
  }, [apiClient, hasActiveCredentials]);

  return (
    <main className="flex min-h-screen flex-col bg-gray-100">
        <div className="w-full border-b border-gray-200 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Hedera AI Assistant</h1>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="bg-yellow-500 text-white">
                  <Key className="mr-2 h-4 w-4" />
                  Credentials
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Verifiable Credentials</SheetTitle>
                    <SheetDescription>
                      Manage verifiable credentials for your AI agents
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Add Credential Button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setShowAddForm(!showAddForm);
                          setCredentialError(null);
                          setCredentialSuccess(null);
                        }}
                        variant={showAddForm ? "outline" : "default"}
                      >
                        {showAddForm ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Credential
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Add Credential Form */}
                    {showAddForm && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Add Hedera Credentials
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {credentialError && (
                            <Alert variant="destructive" className="mb-4">
                              <AlertDescription>{credentialError}</AlertDescription>
                            </Alert>
                          )}
                          {credentialSuccess && (
                            <Alert className="mb-4 border-green-500 bg-green-50">
                              <AlertDescription className="text-green-800">{credentialSuccess}</AlertDescription>
                            </Alert>
                          )}
                          <form onSubmit={handleCredentialSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="operatorAccountId">Operator Account ID</Label>
                              <Input
                                id="operatorAccountId"
                                type="text"
                                placeholder="0.0.123456"
                                value={operatorAccountId}
                                onChange={(e) => setOperatorAccountId(e.target.value)}
                                required
                                pattern="^0\.0\.\d+$"
                              />
                              <p className="text-xs text-muted-foreground">
                                Format: 0.0.xxxxx (e.g., 0.0.123456)
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="privateKey">Private Key</Label>
                              <div className="relative">
                                <Input
                                  id="privateKey"
                                  type={showPrivateKey ? 'text' : 'password'}
                                  placeholder="Enter your private key"
                                  value={privateKey}
                                  onChange={(e) => setPrivateKey(e.target.value)}
                                  required
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                                >
                                  {showPrivateKey ? (
                                    <Lock className="h-4 w-4" />
                                  ) : (
                                    <Key className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Your private key will be encrypted before storage.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="network">Network</Label>
                              <select
                                id="network"
                                value={network}
                                onChange={(e) => setNetwork(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="testnet">Testnet</option>
                                <option value="mainnet">Mainnet</option>
                              </select>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button
                                type="submit"
                                disabled={createCredentialMutation.isPending || !operatorAccountId.trim() || !privateKey.trim()}
                                className="flex-1"
                              >
                                {createCredentialMutation.isPending ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Key className="mr-2 h-4 w-4" />
                                    Save Credentials
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Loading State */}
                    {isLoadingCredentials && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading credentials...</p>
                      </div>
                    )}

                    {/* Error State */}
                    {credentialsFetchError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>
                          {credentialsFetchError instanceof Error 
                            ? credentialsFetchError.message 
                            : 'Failed to load credentials'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Credentials Content */}
                    {!isLoadingCredentials && !credentialsFetchError && (
                      <>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                          <TabsList>
                            <TabsTrigger value="all">All Credentials</TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="revoked">Revoked</TabsTrigger>
                          </TabsList>

                          <TabsContent value="all" className="mt-4">
                            <div className="grid grid-cols-1 gap-6">
                              {filteredCredentials.map((credential) => (
                                <CredentialCard
                                  key={credential.id}
                                  credential={credential}
                                  onDelete={() => deleteCredentialMutation.mutate()}
                                  isDeleting={deleteCredentialMutation.isPending}
                                />
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="active" className="mt-4">
                            <div className="grid grid-cols-1 gap-6">
                              {filteredCredentials.map((credential) => (
                                <CredentialCard
                                  key={credential.id}
                                  credential={credential}
                                  onDelete={() => deleteCredentialMutation.mutate()}
                                  isDeleting={deleteCredentialMutation.isPending}
                                />
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="revoked" className="mt-4">
                            <div className="grid grid-cols-1 gap-6">
                              {filteredCredentials.map((credential) => (
                                <CredentialCard
                                  key={credential.id}
                                  credential={credential}
                                  onDelete={() => deleteCredentialMutation.mutate()}
                                  isDeleting={deleteCredentialMutation.isPending}
                                />
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>

                        {filteredCredentials.length === 0 && (
                          <div className="text-center py-12">
                            <h3 className="text-lg font-medium mb-2">No credentials found</h3>
                            <p className="text-muted-foreground mb-6">
                              {activeTab === "active"
                                ? "You don't have any active credentials."
                                : activeTab === "revoked"
                                  ? "You don't have any revoked credentials."
                                  : "You haven't created any credentials yet."}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-4">
          {/* Payment Status Alert */}
          {!hasActiveCredentials && (
            <Alert className="mb-4 border-amber-500 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Payment Required:</strong> You need to add and activate Hedera credentials to use MCP features. 
                A fixed payment of {paymentAmount} HBAR is required to start the conversation. Please add your credentials using the "View Credentials" button.
              </AlertDescription>
            </Alert>
          )}
          {hasActiveCredentials && !paymentCompleted && (
            <div className="mb-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg shadow-lg">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                  <h3 className="text-xl font-bold text-amber-900">Start Your Conversation</h3>
                </div>
                <p className="text-amber-800">
                  A one-time payment of <strong>{paymentAmount} HBAR</strong> is required to start chatting.
                  <br />
                  <span className="text-sm text-amber-700">
                    Using x402 protocol: Payment will be handled automatically by backend MCP tools using your credentials.
                  </span>
                </p>
                {!paymentCompleted && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ x402 session not initialized. Please click "Start Chat" to initialize payment.
                  </p>
                )}
                <Button
                  onClick={async () => {
                    setGraniteResult('Initializing x402 session...\nThe x402 protocol will automatically handle payment via HTTP 402 flow.');
                    await initializeX402Session();
                  }}
                  disabled={paymentProcessing || !hasActiveCredentials}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  {paymentProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Processing via x402...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-5 w-5" />
                      Start Chat ({paymentAmount} HBAR)
                    </>
                  )}
                </Button>
                {paymentProcessing && (
                  <p className="text-sm text-amber-700 animate-pulse">
                    Transferring {paymentAmount} HBAR to system account...
                  </p>
                )}
              </div>
            </div>
          )}
          {paymentError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment Error:</strong> {paymentError}
              </AlertDescription>
            </Alert>
          )}
          {paymentCompleted && hasActiveCredentials && (
            <Alert className="mb-4 border-green-500 bg-green-50">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>✓ Payment Complete & x402 Active:</strong> {paymentAmount} HBAR transferred successfully. 
                  x402 payment protocol is now enabled for this session.
                </AlertDescription>
              </div>
            </Alert>
          )}
          
          {/* AI Chat Interface - Only show after payment */}
          {paymentCompleted && hasActiveCredentials && (
            <div className="flex flex-col h-[calc(100vh-280px)] min-h-[600px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Hedera AI Assistant</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={endConversationAndSave}
                    disabled={savingMessages || (inboundMessages.length === 0 && outboundMessages.length === 0) || !inboundTopicId || !outboundTopicId}
                    className="text-xs bg-red-500 text-white"
                    title={
                      !inboundTopicId || !outboundTopicId
                        ? 'Topic IDs not configured. Set NEXT_PUBLIC_INBOUND_TOPIC_ID and NEXT_PUBLIC_OUTBOUND_TOPIC_ID in environment variables.'
                        : inboundMessages.length === 0 && outboundMessages.length === 0
                          ? 'No messages to save'
                          : 'Save all messages to Hedera topics'
                    }
                  >
                    {savingMessages ? (
                      <>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        End Conversation
                      </>
                    )}
                  </Button>
                  <Badge className="bg-green-600 text-white">
                    <DollarSign className="h-3 w-3 mr-1" />
                    x402 Active
                  </Badge>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Bot className="h-12 w-12 mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Start a conversation</p>
                    <p className="text-sm mb-6">Ask me anything about Hedera blockchain operations!</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setGranitePrompt('Check my balance');
                          // Focus the input after a short delay
                          setTimeout(() => {
                            const textarea = document.querySelector('textarea[placeholder="Type your message..."]') as HTMLTextAreaElement;
                            textarea?.focus();
                          }, 100);
                        }}
                        disabled={graniteLoading || !paymentCompleted || paymentProcessing || conversationEnded}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Check Balance
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Get sender account from active credential if available
                          const senderAccount = activeCredential?.credentialData?.operatorAccountId || '[senderAccount]';
                          setGranitePrompt(`Build transaction from ${senderAccount} to [receiverAccount] for 10 HBAR`);
                          // Focus the input after a short delay
                          setTimeout(() => {
                            const textarea = document.querySelector('textarea[placeholder="Type your message..."]') as HTMLTextAreaElement;
                            textarea?.focus();
                            // Move cursor to [receiverAccount] position
                            const text = textarea.value;
                            const receiverIndex = text.indexOf('[receiverAccount]');
                            if (receiverIndex !== -1) {
                              textarea.setSelectionRange(receiverIndex, receiverIndex + '[receiverAccount]'.length);
                            }
                          }, 100);
                        }}
                        disabled={graniteLoading || !paymentCompleted || paymentProcessing || conversationEnded}
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Build Transaction
                      </Button>
                    </div>
                  </div>
                )}
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.content ? (
                          <MessageContent content={message.content} />
                        ) : (isStreaming && message.role === 'assistant' ? (
                          <span className="flex items-center gap-1">
                            <span className="animate-pulse">Thinking</span>
                            <span className="flex gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                          </span>
                        ) : '')}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {graniteLoading && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'user' && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="border-t border-gray-200 bg-white">
                {/* Quick Action Buttons */}
                <div className="px-4 pt-3 pb-2 flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGranitePrompt('Check my balance');
                      // Focus the input after a short delay
                      setTimeout(() => {
                        const textarea = document.querySelector('textarea[placeholder="Type your message..."]') as HTMLTextAreaElement;
                        textarea?.focus();
                      }, 100);
                    }}
                    disabled={graniteLoading || !paymentCompleted || paymentProcessing || conversationEnded}
                    className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Wallet className="mr-1.5 h-3.5 w-3.5" />
                    Check Balance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Get sender account from active credential if available
                      const senderAccount = activeCredential?.credentialData?.operatorAccountId || '[sender]';
                      setGranitePrompt(`Build transaction from ${senderAccount} to [receiver] for 10 HBAR`);
                      // Focus the input after a short delay
                      setTimeout(() => {
                        const textarea = document.querySelector('textarea[placeholder="Type your message..."]') as HTMLTextAreaElement;
                        textarea?.focus();
                        // Move cursor to [receiver] position for easy editing
                        const text = textarea.value;
                        const receiverIndex = text.indexOf('[receiver]');
                        if (receiverIndex !== -1) {
                          textarea.setSelectionRange(receiverIndex, receiverIndex + '[receiver]'.length);
                        }
                      }, 100);
                    }}
                    disabled={graniteLoading || !paymentCompleted || paymentProcessing || conversationEnded}
                    className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
                    Build Transaction
                  </Button>
                </div>
                <div className="px-4 pb-3 flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Type your message..."
                      value={granitePrompt}
                      onChange={(e) => {
                        setGranitePrompt(e.target.value);
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!graniteLoading && !paymentProcessing && hasActiveCredentials && granitePrompt.trim() && !conversationEnded) {
                            generateWithGranite(granitePrompt);
                          }
                        }
                      }}
                      disabled={!hasActiveCredentials || !paymentCompleted || paymentProcessing || graniteLoading || conversationEnded}
                      rows={1}
                      style={{ maxHeight: '120px', minHeight: '44px' }}
                    />
                  </div>
                  <button
                    className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    onClick={() => generateWithGranite(granitePrompt)}
                    disabled={!hasActiveCredentials || graniteLoading || !granitePrompt.trim() || !paymentCompleted || paymentProcessing || conversationEnded}
                    title={
                      conversationEnded
                        ? 'Conversation has ended. Please start a new conversation.'
                        : !hasActiveCredentials 
                          ? 'Please add Hedera credentials to use this feature' 
                          : !paymentCompleted
                            ? `Payment required: ${paymentAmount} HBAR. Use the "Start Chat" button above.` 
                          : paymentProcessing 
                            ? 'Processing payment...' 
                            : ''
                    }
                  >
                    {graniteLoading ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {ready === false && (
                  <div className="text-xs text-gray-500 mt-2">Loading Granite AI model...</div>
                )}
                {ready === null && (
                  <div className="text-xs text-gray-500 mt-2">Initializing Granite AI model...</div>
                )}
              </div>
            </div>
          )}
          
          {/* Show message if payment not completed */}
          {!paymentCompleted && hasActiveCredentials && (
            <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500 text-lg">
                Complete payment above to start chatting
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* MCP Results */}
          {mcps.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Found {mcps.length} MCP(s):</h3>
              {mcps.map((mcp) => (
                <div
                  key={mcp.mcpId}
                  className={`p-4 border rounded cursor-pointer transition-colors ${
                    selectedMcp?.mcpId === mcp.mcpId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedMcp(mcp)}
                >
                  <h4 className="font-semibold text-lg">{mcp.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{mcp.description}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-gray-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        validateMcp(mcp);
                      }}
                      disabled={loading || !hasActiveCredentials}
                      title={!hasActiveCredentials ? 'Please add Hedera credentials to validate MCPs' : ''}
                    >
                      {loading ? 'Validating...' : 'Validate'}
                    </button>
                    <button
                      className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:bg-gray-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Call with a default tool name - in production, let user select
                        callMcp(mcp, 'default-tool', {});
                      }}
                      disabled={loading || !hasActiveCredentials}
                      title={!hasActiveCredentials ? 'Please add Hedera credentials to call MCPs' : ''}
                    >
                      {loading ? 'Calling...' : 'Call'}
                    </button>
                  </div>
                  {mcp.capabilities && mcp.capabilities.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold">Capabilities: </span>
                      <span className="text-xs text-gray-500">
                        {Array.isArray(mcp.capabilities) ? mcp.capabilities.join(', ') : mcp.capabilities}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Validation Result */}
          {validationResult && (
            <div className="p-4 bg-green-50 border border-green-300 rounded">
              <h3 className="font-semibold text-green-800 mb-2">Validation Result:</h3>
              <pre className="text-sm text-green-700 overflow-auto">
                {JSON.stringify(validationResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Call Result */}
          {callResult && (
            <div className="p-4 bg-purple-50 border border-purple-300 rounded">
              <h3 className="font-semibold text-purple-800 mb-2">Call Result:</h3>
              <pre className="text-sm text-purple-700 overflow-auto">
                {JSON.stringify(callResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Transformers.js Result (for reference) */}
          {ready !== null && result && (
            <div className="p-4 bg-gray-50 border border-gray-300 rounded">
              <h3 className="font-semibold mb-2">AI Classification Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
      </div>
    </main>
  )
}

// Component to render message content with clickable links
function MessageContent({ content }: { content: string }) {
  // Regular expression to match URLs (including HashScan links)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

interface CredentialCardProps {
  credential: {
    id: string;
    name: string;
    description: string;
    agentId: string;
    tokenId: string;
    isActive: boolean;
    permissions: string[];
    issuanceDate: string | Date | null;
    expirationDate: string | Date | null;
    credentialType?: string;
    credentialData?: any;
  };
  onDelete?: () => void;
  isDeleting?: boolean;
}

function CredentialCard({ credential, onDelete, isDeleting }: CredentialCardProps) {
  // Check if credential is expired
  const isExpired = credential.expirationDate ? new Date(credential.expirationDate) < new Date() : false

  // Format date to readable format
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "No expiration"
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString()
  }

  // Calculate days until expiration
  const getDaysUntilExpiration = () => {
    if (!credential.expirationDate) return null

    const today = new Date()
    const expirationDate = typeof credential.expirationDate === 'string' 
      ? new Date(credential.expirationDate) 
      : credential.expirationDate
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  // Get credential details from credentialData if available
  const credentialDetails = credential.credentialData || {}
  const operatorAccountId = credentialDetails.operatorAccountId || 'N/A'
  const privateKey = credentialDetails.privateKey || 'N/A'
  const network = credentialDetails.network || 'N/A'
  
  // Mask private key for security (show only first and last 4 characters)
  const maskPrivateKey = (key: string) => {
    if (!key || key === 'N/A' || key.length < 8) return key
    return `${key.substring(0, 4)}${'*'.repeat(Math.max(0, key.length - 8))}${key.substring(key.length - 4)}`
  }

  const daysUntilExpiration = getDaysUntilExpiration()

  return (
    <Card className={isExpired || !credential.isActive ? "opacity-75" : ""}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg">{credential.name}</CardTitle>
            {!credential.isActive && (
              <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-50">
                Revoked
              </Badge>
            )}
            {isExpired && credential.isActive && (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-50">
                Expired
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">{credential.tokenId}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{credential.description}</p>

        {/* Credential Details */}
        {credential.credentialType === 'hedera' && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-md">
            <h4 className="text-sm font-medium">Credential Details:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Operator Account ID:</p>
                <p className="font-mono text-xs break-all">{operatorAccountId}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Private Key:</p>
                <p className="font-mono text-xs break-all">{maskPrivateKey(privateKey)}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Network:</p>
                <p className="capitalize">{network}</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Credential
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}