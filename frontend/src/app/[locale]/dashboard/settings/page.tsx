"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Lock, Shield, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RootState } from "@/lib/store"
import { useAuth } from "@/lib/context/auth-context"

export default function SettingsPage() {
  const dispatch = useDispatch()
  const { logout } = useAuth()
  const user = useSelector((state: RootState) => state.user)
  const wallet = useSelector((state: RootState) => state.wallet)

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [autoLockEnabled, setAutoLockEnabled] = useState(true)
  const [autoLockTime, setAutoLockTime] = useState("5")
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("english")

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion would be processed here in a real application.")
      logout()
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-metamynd-purple">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal information and identity verification status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/vibrant-street-market.png" alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-medium">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={user.kycStatus === "verified" ? "default" : "outline"} className="bg-green-600">
                      {user.kycStatus === "verified" ? "Verified" : "Verification Pending"}
                    </Badge>
                    {user.kycStatus === "verified" && (
                      <span className="text-xs text-muted-foreground">
                        Verified on {new Date(user.kycSubmittedAt || "").toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={user.firstName || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={user.lastName || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>Your identity verification status and documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Identity Verification Status</span>
                </div>
                <Badge
                  variant={user.kycStatus === "verified" ? "default" : "outline"}
                  className={user.kycStatus === "verified" ? "bg-green-600" : ""}
                >
                  {user.kycStatus === "verified"
                    ? "Verified"
                    : user.kycStatus === "pending"
                      ? "Pending"
                      : user.kycStatus === "in_progress"
                        ? "In Progress"
                        : user.kycStatus === "under_review"
                          ? "Under Review"
                          : "Not Started"}
                </Badge>
              </div>

              {user.kycStatus === "verified" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Verified Documents</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">ID Document</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-xs text-muted-foreground">
                            {user.kycData?.documents?.idDocument?.name || "Passport"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded on{" "}
                            {new Date(user.kycData?.documents?.idDocument?.uploadedAt || "").toLocaleDateString()}
                          </p>
                          <Badge className="mt-2 bg-green-600">Verified</Badge>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">Proof of Address</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-xs text-muted-foreground">
                            {user.kycData?.documents?.addressDocument?.name || "Utility Bill"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded on{" "}
                            {new Date(user.kycData?.documents?.addressDocument?.uploadedAt || "").toLocaleDateString()}
                          </p>
                          <Badge className="mt-2 bg-green-600">Verified</Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}

              {user.kycStatus !== "verified" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Required</AlertTitle>
                  <AlertDescription>
                    Complete your identity verification to access all platform features.
                  </AlertDescription>
                  <Button size="sm" className="mt-2">
                    Complete Verification
                  </Button>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Permanently delete your account and all associated data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a code via SMS or authenticator app when logging in.
                  </p>
                </div>
                <Switch id="2fa" checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>

              {twoFactorEnabled && (
                <div className="pt-2">
                  <Alert>
                    <AlertTitle>Two-Factor Authentication is enabled</AlertTitle>
                    <AlertDescription>
                      You will need to enter a code from your authenticator app when logging in.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biometric Authentication</CardTitle>
              <CardDescription>Use your device's biometric features for faster login.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="biometric">Biometric Login</Label>
                  <p className="text-sm text-muted-foreground">
                    Use fingerprint or face recognition to log in on supported devices.
                  </p>
                </div>
                <Switch id="biometric" checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auto-Lock</CardTitle>
              <CardDescription>Automatically lock your account after a period of inactivity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-lock">Auto-Lock</Label>
                  <p className="text-sm text-muted-foreground">Automatically log out after a period of inactivity.</p>
                </div>
                <Switch id="auto-lock" checked={autoLockEnabled} onCheckedChange={setAutoLockEnabled} />
              </div>

              {autoLockEnabled && (
                <div className="pt-2">
                  <Label htmlFor="auto-lock-time">Auto-Lock Time (minutes)</Label>
                  <Select value={autoLockTime} onValueChange={setAutoLockTime}>
                    <SelectTrigger id="auto-lock-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
              <CardDescription>Review your recent login activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="grid grid-cols-3 p-4 font-medium border-b">
                    <div>Date & Time</div>
                    <div>Location</div>
                    <div>Device</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-3 p-4">
                      <div className="text-sm">{new Date().toLocaleString()}</div>
                      <div className="text-sm">San Francisco, CA</div>
                      <div className="text-sm">Chrome on macOS</div>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <div className="text-sm">{new Date(Date.now() - 86400000).toLocaleString()}</div>
                      <div className="text-sm">San Francisco, CA</div>
                      <div className="text-sm">Safari on iOS</div>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <div className="text-sm">{new Date(Date.now() - 172800000).toLocaleString()}</div>
                      <div className="text-sm">San Francisco, CA</div>
                      <div className="text-sm">Chrome on macOS</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
              <CardDescription>View and manage your wallet settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <div className="flex items-center gap-2">
                  <Input value={wallet?.address || "0x0000...0000"} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(wallet?.address || "")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-copy"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c0-1.1.9-2 2-2h2" />
                      <path d="M4 12c0-1.1.9-2 2-2h2" />
                      <path d="M4 8c0-1.1.9-2 2-2h2" />
                    </svg>
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>DID Document</Label>
                <div className="flex items-center gap-2">
                  <Input value={wallet?.did || "did:hedera:testnet:..."} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(wallet?.did || "")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-copy"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c0-1.1.9-2 2-2h2" />
                      <path d="M4 12c0-1.1.9-2 2-2h2" />
                      <path d="M4 8c0-1.1.9-2 2-2h2" />
                    </svg>
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Balance</Label>
                <div className="flex items-center gap-2">
                  <Input value={`${wallet?.balance || 0} HBAR`} readOnly />
                </div>
              </div>

              <Alert>
                <Wallet className="h-4 w-4" />
                <AlertTitle>Wallet Security</AlertTitle>
                <AlertDescription>
                  Your wallet is secured using industry-standard encryption. Never share your private keys with anyone.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recovery Options</CardTitle>
              <CardDescription>Set up recovery options for your wallet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recovery Phrase</Label>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Your recovery phrase is stored securely. You can view it by clicking the button below.
                  </p>
                </div>
                <Button variant="outline" className="mt-2">
                  <Lock className="mr-2 h-4 w-4" />
                  View Recovery Phrase
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Backup Options</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Switch id="cloud-backup" />
                    <Label htmlFor="cloud-backup">Enable Cloud Backup</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="email-backup" />
                    <Label htmlFor="email-backup">Email Recovery Information</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Applications</CardTitle>
              <CardDescription>Manage applications connected to your wallet.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="grid grid-cols-3 p-4 font-medium border-b">
                    <div>Application</div>
                    <div>Permissions</div>
                    <div>Actions</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-3 p-4 items-center">
                      <div className="text-sm font-medium">MetaMynd Mobile App</div>
                      <div className="text-sm">Full Access</div>
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 p-4 items-center">
                      <div className="text-sm font-medium">Hedera Explorer</div>
                      <div className="text-sm">Read Only</div>
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about important account activities.
                  </p>
                </div>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>

              {notificationsEnabled && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Channels</h4>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch id="email-notifications" defaultChecked />
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="push-notifications" defaultChecked />
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="sms-notifications" />
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Notification Types</h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="security-alerts">Security Alerts</Label>
                          <Switch id="security-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="transaction-updates">Transaction Updates</Label>
                          <Switch id="transaction-updates" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="agent-activities">Agent Activities</Label>
                          <Switch id="agent-activities" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="credential-updates">Credential Updates</Label>
                          <Switch id="credential-updates" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="marketing-updates">Marketing & Updates</Label>
                          <Switch id="marketing-updates" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>View your recent notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="divide-y">
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">New Login Detected</div>
                        <div className="text-xs text-muted-foreground">{new Date().toLocaleString()}</div>
                      </div>
                      <p className="text-sm">A new login was detected from San Francisco, CA using Chrome on macOS.</p>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Agent Activity</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(Date.now() - 3600000).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm">Your Financial Advisor agent completed a transaction on your behalf.</p>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Credential Issued</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(Date.now() - 86400000).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm">A new credential was issued to your wallet: "Identity Verification".</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Notifications
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the appearance of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
                </div>
                <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
              <CardDescription>Set your preferred language and regional settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc-8">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc+0">UTC</SelectItem>
                    <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="utc+8">China Standard Time (UTC+8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="mdy">
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                    <SelectItem value="iso">ISO 8601 (YYYY-MM-DD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>Configure accessibility settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="screen-reader">Screen Reader Support</Label>
                  <p className="text-sm text-muted-foreground">Optimize the interface for screen readers.</p>
                </div>
                <Switch id="screen-reader" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility.</p>
                </div>
                <Switch id="high-contrast" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduce-motion">Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">Minimize animations and transitions.</p>
                </div>
                <Switch id="reduce-motion" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="x-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced application settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Usage Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous usage data collection to improve the platform.
                  </p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="beta-features">Beta Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable experimental features that are still in development.
                  </p>
                </div>
                <Switch id="beta-features" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">Show additional debugging information.</p>
                </div>
                <Switch id="debug-mode" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
