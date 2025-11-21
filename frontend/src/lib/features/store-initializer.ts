"use client"

import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { setAgents } from "./agents/agentsSlice"
import { setCredentials } from "./credentials/credentialsSlice"
import { setWalletAddress, setBalance, setDID, setConnectionStatus, setTokens, setNetwork } from "./wallet/walletSlice"
import { sampleAgents, sampleCredentials, sampleWalletData } from "@/lib/utils/sample-data"

export function useInitializeStore() {
  const dispatch = useDispatch()
  const initialized = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return
    initialized.current = true

    console.log("Initializing store with sample data")

    // Initialize with sample data
    dispatch(setAgents(sampleAgents))
    dispatch(setCredentials(sampleCredentials))

    // Initialize with mock wallet data
    dispatch(setWalletAddress(sampleWalletData.address))
    dispatch(setBalance(sampleWalletData.balance))
    dispatch(setDID(sampleWalletData.did))
    dispatch(setConnectionStatus(sampleWalletData.isConnected))
    dispatch(setNetwork("Hedera Testnet"))

    // Initialize with sample tokens
    dispatch(
      setTokens([
        { name: "HBAR", balance: "100.5", value: "$10.05 USD" },
        { name: "NFT Credentials", count: 3 },
      ]),
    )
  }, [dispatch])

  return null
}
