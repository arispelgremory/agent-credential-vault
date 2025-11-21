import { LucideIcon } from "lucide-react";

export interface NavLinkProps {
    key: string;
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: "default" | "ghost";
    href: string;
    allowedRoles: (string | "*")[];
    children?: Array<Omit<NavLinkProps, "variant">>;
}
