"use client"

import { useState } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Cookies from "js-cookie"

export function AuthDebugger() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, checkAuth } = useAuth()
  const user = useSelector((state: RootState) => state.user)

  const getLocalStorageUser = () => {
    try {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user) : null
    } catch (error) {
      return "Error parsing user"
    }
  }

  const getCookies = () => {
    return {
      auth_token: Cookies.get("auth_token"),
      kyc_verified: Cookies.get("kyc_verified"),
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-white/80 backdrop-blur-sm"
      >
        Debug Auth
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">Auth Debugger</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-4">
        <div>
          <h3 className="font-bold mb-1">Auth Context State:</h3>
          <div className="bg-gray-100 p-2 rounded">
            <p>isAuthenticated: {isAuthenticated.toString()}</p>
            {/*<p>isKycVerified: {isKycVerified.toString()}</p>*/}
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-1">Redux State:</h3>
          <div className="bg-gray-100 p-2 rounded">
            <p>isAuthenticated: {user.isAuthenticated.toString()}</p>
            <p>kycStatus: {user.kycStatus || "null"}</p>
            <p>email: {user.email || "null"}</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-1">Cookies:</h3>
          <div className="bg-gray-100 p-2 rounded">
            <p>auth_token: {getCookies().auth_token || "not set"}</p>
            <p>kyc_verified: {getCookies().kyc_verified || "not set"}</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-1">LocalStorage:</h3>
          <div className="bg-gray-100 p-2 rounded overflow-auto max-h-32">
            <pre>{JSON.stringify(getLocalStorageUser(), null, 2)}</pre>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" onClick={() => checkAuth()}>
            Refresh Auth
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              Cookies.set("kyc_verified", "true", {
                expires: 7,
                path: "/",
                sameSite: "strict",
              })
              checkAuth()
            }}
          >
            Force KYC Verified
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
