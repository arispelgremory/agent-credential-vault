"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Clock, FileText, User, MapPin, Camera } from "lucide-react"

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user)
  const { kycData, kycStatus } = user

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "under_review":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Under Review
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            In Progress
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getDocumentStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">View and manage your personal information</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="documents">KYC Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5" /> Basic Information
              </CardTitle>
              {getStatusBadge(kycStatus)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">First Name</p>
                  <p className="font-medium">{user.firstName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Name</p>
                  <p className="font-medium">{user.lastName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{kycData.personalInfo?.dateOfBirth || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{kycData.personalInfo?.nationality || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Type</p>
                  <p className="font-medium">{kycData.personalInfo?.idType || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Number</p>
                  <p className="font-medium">{kycData.personalInfo?.idNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KYC Submitted</p>
                  <p className="font-medium">{formatDate(user.kycSubmittedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5" /> Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {kycData.address ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Address Line 1</p>
                    <p className="font-medium">{kycData.address.line1 || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address Line 2</p>
                    <p className="font-medium">{kycData.address.line2 || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{kycData.address.city || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State/Province</p>
                    <p className="font-medium">{kycData.address.state || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Postal Code</p>
                    <p className="font-medium">{kycData.address.postalCode || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">{kycData.address.country || "Not provided"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No address information provided</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {kycData.documents ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="bg-muted rounded-md p-2">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">ID Document</h3>
                        <div className="flex items-center space-x-2">
                          {getDocumentStatusIcon(kycData.documents.idDocument?.verificationStatus)}
                          <span className="text-sm">
                            {kycData.documents.idDocument?.verificationStatus === "verified"
                              ? "Verified"
                              : kycData.documents.idDocument?.verificationStatus === "rejected"
                                ? "Rejected"
                                : "Pending"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {kycData.documents.idDocument?.name || "No document uploaded"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded: {formatDate(kycData.documents.idDocument?.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="bg-muted rounded-md p-2">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Proof of Address</h3>
                        <div className="flex items-center space-x-2">
                          {getDocumentStatusIcon(kycData.documents.addressDocument?.verificationStatus)}
                          <span className="text-sm">
                            {kycData.documents.addressDocument?.verificationStatus === "verified"
                              ? "Verified"
                              : kycData.documents.addressDocument?.verificationStatus === "rejected"
                                ? "Rejected"
                                : "Pending"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {kycData.documents.addressDocument?.name || "No document uploaded"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded: {formatDate(kycData.documents.addressDocument?.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="bg-muted rounded-md p-2">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Selfie Verification</h3>
                        <div className="flex items-center space-x-2">
                          {getDocumentStatusIcon(kycData.documents.selfieImage?.verificationStatus)}
                          <span className="text-sm">
                            {kycData.documents.selfieImage?.verificationStatus === "verified"
                              ? "Verified"
                              : kycData.documents.selfieImage?.verificationStatus === "rejected"
                                ? "Rejected"
                                : "Pending"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {kycData.documents.selfieImage?.name || "No selfie uploaded"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded: {formatDate(kycData.documents.selfieImage?.uploadedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Documents Submitted</h3>
                  <p className="text-sm text-muted-foreground">You haven't submitted any KYC documents yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
