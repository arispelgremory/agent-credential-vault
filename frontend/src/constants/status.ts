export enum StatusList {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export enum OutletStatusList {
    TODO = "To Do",
    COMPLETED = "Completed",
}

export enum FieldOperationStaffStatusList {
    PENDING_APPROVAL = "pendingApproval",
    APPROVED = "approved",
    REJECTED = "rejected",
}

export enum OrderStatusList {
    COMPLETED = "Completed",
    PENDING_APPROVAL = "Pending Approval",
    CANCELLED = "Cancelled",
    TOSHIP = "To Ship",
}

export enum PaymentStatusList {
    PAID = "paid",
    UNPAID = "unpaid",
    PENDING = "pending",
    OVERDUE = "overdue",
}

export enum CollectionStatusList {
    INVOICE = "invoiced",
    DEBITNOTE = "debitnote",
    CREDITNOTE = "creditnote",
    COMPLETED = "completed",
}

// Add this enum at the top of the file to match dashboard-types.ts
export enum JobStatusList {
    JobRequest = "jobRequest",
    Assigned = "assigned",
    ToDo = "To Do",
    Completed = "completed",
    Cancelled = "cancelled",
    Missed = "missed",
}

export enum ApprovalStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
}

export enum DueStatusList {
    TOPAY = "To Pay",
    PAID = "Paid",
    OVERDUE = "Overdue",
}

export enum PromotionStatusList {
    ACTIVE = "active",
    EXPIRED = "expired",
    SCHEDULED = "scheduled",
    DRAFT = "draft",
}

export const StatusColors = {
    // Approval status colors
    draft: {
        bg: "#D4D4D4",
        text: "#262626",
        border: "#262626",
        tailwind: "bg-neutral-300 text-neutral-800 border-neutral-800",
    },
    pending: {
        bg: "#FDBA74",
        text: "#9A3412",
        border: "#9A3412",
        tailwind: "bg-orange-300 text-orange-800 border-orange-800",
    },

    // General status colors
    active: { bg: "#86EFAC", text: "#166534", border: "#166534", tailwind: "bg-green-300 text-green-800 border-green-800" },
    inactive: {
        bg: "#D4D4D4",
        text: "#262626",
        border: "#262626",
        tailwind: "bg-neutral-300 text-neutral-800 border-neutral-800",
    },
    maintenance: {
        bg: "#FDE047",
        text: "#854D0E",
        border: "#854D0E",
        tailwind: "bg-yellow-300 text-yellow-800 border-yellow-800",
    },

    // Collection status colors
    invoiced: { bg: "#93C5FD", text: "#1E40AF", border: "#1E40AF", tailwind: "bg-blue-300 text-blue-800 border-blue-800" },
    debitnote: {
        bg: "#FDE047",
        text: "#854D0E",
        border: "#854D0E",
        tailwind: "bg-yellow-300 text-yellow-800 border-yellow-800",
    },
    creditnote: {
        bg: "#FDBA74",
        text: "#9A3412",
        border: "#9A3412",
        tailwind: "bg-orange-300 text-orange-800 border-orange-800",
    },

    // Payment status colors
    paid: { bg: "#86EFAC", text: "#166534", border: "#166534", tailwind: "bg-green-300 text-green-800 border-green-800" },
    unpaid: { bg: "#D4D4D4", text: "#27272A", border: "#27272A", tailwind: "bg-zinc-300 text-zinc-800 border-zinc-800" },
    overdue: {
        bg: "#FDBA74",
        text: "#9A3412",
        border: "#9A3412",
        tailwind: "bg-orange-300 text-orange-800 border-orange-800",
    },

    // Job status colors
    jobrequest: {
        bg: "#FDBA74",
        text: "#9A3412",
        border: "#9A3412",
        tailwind: "bg-orange-300 text-orange-800 border-orange-800",
    },
    assigned: { bg: "#93C5FD", text: "#1E40AF", border: "#1E40AF", tailwind: "bg-blue-300 text-blue-800 border-blue-800" },
    inprogress: {
        bg: "#FDE047",
        text: "#854D0E",
        border: "#854D0E",
        tailwind: "bg-yellow-300 text-yellow-800 border-yellow-800",
    },
    completed: {
        bg: "#86EFAC",
        text: "#166534",
        border: "#166534",
        tailwind: "bg-green-300 text-green-800 border-green-800",
    },
    cancelled: { bg: "#FCA5A5", text: "#991B1B", border: "#991B1B", tailwind: "bg-red-300 text-red-800 border-red-800" },
    missed: { bg: "#FCA5A5", text: "#991B1B", border: "#991B1B", tailwind: "bg-red-300 text-red-800 border-red-800" },

    // Field Operation Staff status colors
    pendingapproval: {
        bg: "#FDBA74",
        text: "#9A3412",
        border: "#9A3412",
        tailwind: "bg-orange-300 text-orange-800 border-orange-800",
    },
    approved: {
        bg: "#86EFAC",
        text: "#166534",
        border: "#166534",
        tailwind: "bg-green-300 text-green-800 border-green-800",
    },
    rejected: { bg: "#FCA5A5", text: "#991B1B", border: "#991B1B", tailwind: "bg-red-300 text-red-800 border-red-800" },

    // Order status colors
    delivered: {
        bg: "#86EFAC",
        text: "#166534",
        border: "#166534",
        tailwind: "bg-green-300 text-green-800 border-green-800",
    },
    toship: {
        bg: "#FDBA74",
        text: "#9A3412",
        border: "#9A3412",
        tailwind: "bg-orange-300 text-orange-800 border-orange-800",
    },

    // Supplier sales status colors
    increase: {
        bg: "#86EFAC",
        text: "#166534",
        border: "#166534",
        tailwind: "bg-green-300 text-green-800 border-green-800",
    },
    decrease: { bg: "#FCA5A5", text: "#991B1B", border: "#991B1B", tailwind: "bg-red-300 text-red-800 border-red-800" },
    unstable: {
        bg: "#FDBA74",
        text: "#9A3412",
        border: "#9A3412",
        tailwind: "bg-orange-300 text-orange-800 border-orange-800",
    },

    // Due status colors
    topay: {
        bg: "#FDBA74",
        text: "#9A3412",
        border: "#9A3412",
        tailwind: "bg-orange-300 text-orange-800 border-orange-800",
    },

    // Promotion status colors
    scheduled: {
        bg: "#93C5FD",
        text: "#1E40AF",
        border: "#1E40AF",
        tailwind: "bg-blue-300 text-blue-800 border-blue-800",
    },
    expired: {
        bg: "#FCA5A5",
        text: "#991B1B",
        border: "#991B1B",
        tailwind: "bg-red-300 text-red-800 border-red-800",
    },
} as const;

export const getStatusHexColor = (status: string): string => {
    if (!status) return "#E5E7EB";

    // Convert camelCase, snake_case, or kebab-case to lowercase without spaces
    const normalizedStatus = String(status)
        .split(/(?=[A-Z])/) // Split on capital letters
        .join("")
        .toLowerCase()
        .split(/[-_\s]/) // Split on hyphens, underscores and spaces
        .join("");

    const statusColor = StatusColors[normalizedStatus as keyof typeof StatusColors];
    return statusColor?.bg || "#E5E7EB";
};

export const getStatusTailwindColor = (status: string | undefined): string => {
    if (!status) return "bg-gray-200";

    // Convert camelCase, snake_case, or kebab-case to lowercase without spaces
    const normalizedStatus = String(status)
        .replace(/([A-Z])/g, (c) => c.toLowerCase()) // Handle camelCase
        .replace(/[-_\s]/g, "") // Remove hyphens, underscores and spaces
        .toLowerCase();

    const statusColor = StatusColors[normalizedStatus as keyof typeof StatusColors];
    return statusColor?.tailwind || "bg-gray-200";
};
