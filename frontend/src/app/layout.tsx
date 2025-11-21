import { Inter } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "@/lib/context/auth-context";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Provider } from "jotai";
import { ReduxProvider } from "@/providers/redux-provider";

const _inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={_inter.className}>
                <ReduxProvider>
                    <Provider>
                        <AuthProvider>
                            <QueryProvider>
                                {children}
                                <Toaster />
                            </QueryProvider>
                        </AuthProvider>
                    </Provider>
                </ReduxProvider>
            </body>
        </html>
    );
}
