export interface StructuredPermission {
  type: PermissionType
  operator: PermissionOperator
  value: any // This will be typed based on the permission type
}

export type PermissionType = "DataAccess" | "Action" | "Temporal" | "Geographic" | "Delegation" | "Ethical"

export type PermissionOperator =
  | "allow"
  | "deny"
  | "require"
  | "enable"
  | "disable"
  | "limit"
  | "before"
  | "after"
  | "during"
  | "within"
  | "outside"
  | "permit"
  | "restrict"
  | "prohibit"

// Type-specific value interfaces
export interface DataAccessValue {
  resource: string
  access: "read" | "write" | "delete"
}

export interface ActionValue {
  action: string
  max_calls?: number
  rate_limit?: string
}

export interface TemporalValue {
  window?: string
  days?: string[]
  start_date?: string
  end_date?: string
}

export interface GeographicValue {
  region?: string
  coordinates?: {
    lat: number
    lng: number
    radius?: number
  }
}

export interface DelegationValue {
  max_depth: number
  approved_agents?: string[]
}

export interface EthicalValue {
  standard: string
  rules?: string[]
}

// Helper function to convert structured permission to string for display
export function permissionToString(permission: StructuredPermission): string {
  let result = `${permission.type}.${permission.operator}`

  switch (permission.type) {
    case "DataAccess":
      const dataValue = permission.value as DataAccessValue
      result += `.${dataValue.resource}.${dataValue.access}`
      break
    case "Action":
      const actionValue = permission.value as ActionValue
      result += `.${actionValue.action}`
      if (actionValue.max_calls) result += `.max(${actionValue.max_calls})`
      if (actionValue.rate_limit) result += `.rate(${actionValue.rate_limit})`
      break
    case "Temporal":
      const tempValue = permission.value as TemporalValue
      if (tempValue.window) result += `.${tempValue.window}`
      if (tempValue.days) result += `.${tempValue.days.join(",")}`
      break
    case "Geographic":
      const geoValue = permission.value as GeographicValue
      if (geoValue.region) result += `.${geoValue.region}`
      break
    case "Delegation":
      const delValue = permission.value as DelegationValue
      result += `.depth(${delValue.max_depth})`
      break
    case "Ethical":
      const ethValue = permission.value as EthicalValue
      result += `.${ethValue.standard}`
      break
  }

  return result
}

// Helper function to convert string to structured permission (for backward compatibility)
export function stringToStructuredPermission(permString: string): StructuredPermission {
  // Simple conversion for legacy string permissions
  const parts = permString.split(".")

  if (parts.length >= 2) {
    // Try to map to a structured format
    if (parts[0] === "Medical") {
      return {
        type: "DataAccess",
        operator: "allow",
        value: {
          resource: `dataset:${parts.join("_").toLowerCase()}`,
          access: parts.includes("Write") ? "write" : "read",
        },
      }
    } else if (parts[0] === "Financial") {
      return {
        type: "DataAccess",
        operator: "allow",
        value: {
          resource: `dataset:${parts.join("_").toLowerCase()}`,
          access: parts.includes("Write") ? "write" : "read",
        },
      }
    } else if (parts[0] === "Calendar") {
      return {
        type: "Action",
        operator: "enable",
        value: {
          action: parts.includes("Write") ? "calendar_modify" : "calendar_view",
        },
      }
    } else {
      // Default fallback
      return {
        type: "Action",
        operator: "enable",
        value: {
          action: permString.toLowerCase().replace(/\./g, "_"),
        },
      }
    }
  }

  // Default fallback
  return {
    type: "Action",
    operator: "enable",
    value: {
      action: permString.toLowerCase().replace(/\./g, "_"),
    },
  }
}
