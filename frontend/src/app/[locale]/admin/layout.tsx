import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | Semutz Admin",
        default: "Admin Dashboard",
    },
};

export default function Root({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
