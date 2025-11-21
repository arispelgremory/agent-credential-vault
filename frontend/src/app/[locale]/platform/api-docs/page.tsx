import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "API Documentation | MetaMynd",
  description: "Comprehensive API documentation for MetaMynd's W3C-compliant AI Agent Identity Platform",
}

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">API Documentation</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <p className="mb-4">
          Welcome to the MetaMynd API documentation. Our API allows you to integrate our identity verification and
          management services into your applications.
        </p>
        <p className="mb-4">
          Base URL: <code className="bg-gray-100 px-2 py-1 rounded">https://api.metamynd.io/v1</code>
        </p>
        <p>
          All API requests require authentication using an API key. You can generate an API key in your dashboard
          settings.
        </p>
      </div>

      <Tabs defaultValue="rest">
        <TabsList className="mb-6">
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="graphql">GraphQL</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="rest">
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Authentication</h2>
              <p className="mb-4">All API requests must include your API key in the Authorization header:</p>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">{`Authorization: Bearer YOUR_API_KEY`}</pre>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Identity Management Endpoints</h2>

              <div className="mb-6 pb-6 border-b">
                <h3 className="text-lg font-medium mb-2">Create a DID</h3>
                <p className="mb-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">POST</span>{" "}
                  /identities
                </p>
                <p className="mb-4">Creates a new decentralized identifier (DID) /identities</p>
                <p className="mb-4">Creates a new decentralized identifier (DID) for a user or AI agent.</p>
                <h4 className="text-md font-medium mb-2">Request Body</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-4">
                  {`{
  "type": "user" | "agent",
  "name": "string",
  "owner_did": "string" // Required for agent DIDs
}`}
                </pre>
                <h4 className="text-md font-medium mb-2">Response</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {`{
  "did": "did:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
  "type": "user",
  "name": "John Doe",
  "created_at": "2023-04-03T12:34:56Z"
}`}
                </pre>
              </div>

              <div className="mb-6 pb-6 border-b">
                <h3 className="text-lg font-medium mb-2">Get DID Details</h3>
                <p className="mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">GET</span>{" "}
                  /identities/{"{did}"}
                </p>
                <p className="mb-4">Retrieves details about a specific DID.</p>
                <h4 className="text-md font-medium mb-2">Response</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {`{
  "did": "did:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
  "type": "user",
  "name": "John Doe",
  "created_at": "2023-04-03T12:34:56Z",
  "status": "active",
  "verification_status": "verified"
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">List DIDs</h3>
                <p className="mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">GET</span>{" "}
                  /identities
                </p>
                <p className="mb-4">Lists all DIDs owned by the authenticated user.</p>
                <h4 className="text-md font-medium mb-2">Query Parameters</h4>
                <ul className="list-disc pl-6 mb-4">
                  <li>
                    <code>type</code> - Filter by DID type (user, agent)
                  </li>
                  <li>
                    <code>limit</code> - Number of results per page (default: 20)
                  </li>
                  <li>
                    <code>offset</code> - Pagination offset (default: 0)
                  </li>
                </ul>
                <h4 className="text-md font-medium mb-2">Response</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {`{
  "data": [
    {
      "did": "did:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
      "type": "user",
      "name": "John Doe",
      "created_at": "2023-04-03T12:34:56Z"
    },
    {
      "did": "did:hedera:testnet:z6MkhasdgUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
      "type": "agent",
      "name": "Assistant Bot",
      "created_at": "2023-04-05T10:22:33Z"
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}`}
                </pre>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Verifiable Credentials Endpoints</h2>

              <div className="mb-6 pb-6 border-b">
                <h3 className="text-lg font-medium mb-2">Issue Credential</h3>
                <p className="mb-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">POST</span>{" "}
                  /credentials
                </p>
                <p className="mb-4">Issues a new verifiable credential.</p>
                <h4 className="text-md font-medium mb-2">Request Body</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-4">
                  {`{
  "subject_did": "did:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
  "type": "IdentityCredential",
  "claims": {
    "name": "John Doe",
    "email": "john@example.com",
    "birthDate": "1990-01-01"
  },
  "expiration_date": "2024-04-03T12:34:56Z"
}`}
                </pre>
                <h4 className="text-md font-medium mb-2">Response</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {`{
  "id": "vc:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
  "subject_did": "did:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
  "issuer_did": "did:hedera:testnet:z6MkhasdgUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
  "type": "IdentityCredential",
  "issuance_date": "2023-04-03T12:34:56Z",
  "expiration_date": "2024-04-03T12:34:56Z",
  "status": "active"
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Verify Credential</h3>
                <p className="mb-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">POST</span>{" "}
                  /credentials/verify
                </p>
                <p className="mb-4">Verifies a credential's authenticity and validity.</p>
                <h4 className="text-md font-medium mb-2">Request Body</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-4">
                  {`{
  "credential_id": "vc:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci"
}`}
                </pre>
                <h4 className="text-md font-medium mb-2">Response</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {`{
  "verified": true,
  "status": "active",
  "issuer": {
    "did": "did:hedera:testnet:z6MkhasdgUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
    "name": "MetaMynd Verification Authority"
  },
  "expiration": "2024-04-03T12:34:56Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="graphql">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">GraphQL API</h2>
            <p className="mb-4">
              Our GraphQL API provides a flexible way to query and mutate identity and credential data.
            </p>
            <p className="mb-4">
              Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">https://api.metamynd.io/v1/graphql</code>
            </p>

            <h3 className="text-lg font-medium mt-6 mb-4">Schema</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-6">
              {`type Query {
  identity(did: ID!): Identity
  identities(type: IdentityType, limit: Int, offset: Int): IdentityConnection
  credential(id: ID!): Credential
  credentials(subjectDid: ID, type: String, limit: Int, offset: Int): CredentialConnection
}

type Mutation {
  createIdentity(input: CreateIdentityInput!): Identity
  issueCredential(input: IssueCredentialInput!): Credential
  verifyCredential(id: ID!): VerificationResult
}

type Identity {
  did: ID!
  type: IdentityType!
  name: String
  createdAt: DateTime!
  status: IdentityStatus!
  verificationStatus: VerificationStatus
  owner: Identity
  agents: [Identity]
}

enum IdentityType {
  USER
  AGENT
}

enum IdentityStatus {
  ACTIVE
  SUSPENDED
  REVOKED
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
  REJECTED
}

type IdentityConnection {
  edges: [IdentityEdge]
  pageInfo: PageInfo!
  totalCount: Int!
}

type IdentityEdge {
  node: Identity!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Credential {
  id: ID!
  type: String!
  subject: Identity!
  issuer: Identity!
  issuanceDate: DateTime!
  expirationDate: DateTime
  status: CredentialStatus!
  claims: JSON
}

enum CredentialStatus {
  ACTIVE
  SUSPENDED
  REVOKED
  EXPIRED
}

type CredentialConnection {
  edges: [CredentialEdge]
  pageInfo: PageInfo!
  totalCount: Int!
}

type CredentialEdge {
  node: Credential!
  cursor: String!
}

type VerificationResult {
  verified: Boolean!
  status: CredentialStatus!
  issuer: Identity
  expiration: DateTime
}

input CreateIdentityInput {
  type: IdentityType!
  name: String
  ownerDid: ID
}

input IssueCredentialInput {
  subjectDid: ID!
  type: String!
  claims: JSON!
  expirationDate: DateTime
}

scalar DateTime
scalar JSON`}
            </pre>

            <h3 className="text-lg font-medium mb-4">Example Queries</h3>

            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Get Identity</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {`query GetIdentity($did: ID!) {
  identity(did: $did) {
    did
    type
    name
    createdAt
    status
    verificationStatus
    owner {
      did
      name
    }
    agents {
      did
      name
      type
    }
  }
}`}
              </pre>
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">Issue Credential</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {`mutation IssueCredential($input: IssueCredentialInput!) {
  issueCredential(input: $input) {
    id
    type
    subject {
      did
      name
    }
    issuer {
      did
      name
    }
    issuanceDate
    expirationDate
    status
  }
}`}
              </pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Webhooks</h2>
            <p className="mb-4">
              Webhooks allow you to receive real-time notifications about events in your MetaMynd account.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-4">Setting Up Webhooks</h3>
            <p className="mb-4">
              You can configure webhooks in your dashboard settings. Provide a URL where you want to receive webhook
              events.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-4">Event Types</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Event</th>
                    <th className="py-2 px-4 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-2 px-4">
                      <code>identity.created</code>
                    </td>
                    <td className="py-2 px-4">A new DID has been created</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-4">
                      <code>identity.updated</code>
                    </td>
                    <td className="py-2 px-4">A DID has been updated</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-4">
                      <code>identity.verified</code>
                    </td>
                    <td className="py-2 px-4">A DID has been verified</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-4">
                      <code>credential.issued</code>
                    </td>
                    <td className="py-2 px-4">A new credential has been issued</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-4">
                      <code>credential.verified</code>
                    </td>
                    <td className="py-2 px-4">A credential has been verified</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-4">
                      <code>credential.revoked</code>
                    </td>
                    <td className="py-2 px-4">A credential has been revoked</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium mt-6 mb-4">Webhook Payload</h3>
            <p className="mb-4">Each webhook event includes a payload with details about the event:</p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {`{
  "event": "credential.issued",
  "timestamp": "2023-04-03T12:34:56Z",
  "data": {
    "credential_id": "vc:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
    "subject_did": "did:hedera:testnet:z6MkrBdNdwUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
    "issuer_did": "did:hedera:testnet:z6MkhasdgUPnXDVD1DCxf9WR3ZQHwMRJCS1TvBJBHR6Vhci",
    "type": "IdentityCredential"
  }
}`}
            </pre>

            <h3 className="text-lg font-medium mt-6 mb-4">Security</h3>
            <p className="mb-4">
              All webhook requests include a signature header that you can use to verify the authenticity of the
              request:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {`X-MetaMynd-Signature: sha256=5257a869e7bdf3ecf7f2f6b8dbc3ecdfe5d0d234`}
            </pre>
            <p className="mt-4">
              The signature is a HMAC SHA-256 hash of the request body using your webhook secret as the key.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
