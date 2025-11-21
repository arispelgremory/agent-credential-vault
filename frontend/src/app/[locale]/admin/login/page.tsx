export const runtime = "edge";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";

import { Typography } from "@/components/ui/typography";

import { cn } from "@/lib/utils";

import "@/app/globals.css";
import { LanguageSwitcher } from "@/features/language-switcher/language-switcher";
import { LoginForm } from "@/features/site-login/components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
};

export default function LoginPage(props: { params: Promise<{ locale: string }> }) {
    const params = use(props.params);

    const { locale } = params;

    // unstable_setRequestLocale(locale);
    const t = useTranslations("login");

    return (
        <div className="relative container hidden h-svh flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* <Link
            to="/examples/authentication"
            className={cn(
                buttonVariants({ variant: "ghost" }),
                "absolute right-4 top-4 md:right-8 md:top-8"
            )}
            >
            Login
            </Link> */}
            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    Acme Inc
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;This library has saved me countless hours of work and helped me deliver stunning designs
                            to my clients faster than ever before.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
            <div className="relative flex h-full flex-col justify-center lg:px-8 lg:py-10">
                <LanguageSwitcher _locale={locale} className={"absolute top-10 right-10"} data-testid="language-switcher" />
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <Typography
                            element={"h1"}
                            className={cn("text-2xl! font-semibold tracking-tight")}
                            data-testid="title-login"
                        >
                            {t("title")}
                        </Typography>
                        <Typography className="text-muted-foreground text-sm" data-testid="subtitle-login">
                            {t("subtitle")}
                        </Typography>
                    </div>
                    {/* <UserAuthForm /> */}
                    <LoginForm />
                    <Typography className="text-muted-foreground px-8 text-center text-sm">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="hover:text-primary underline underline-offset-4">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="hover:text-primary underline underline-offset-4">
                            Privacy Policy
                        </Link>
                        .
                    </Typography>
                </div>
            </div>
        </div>
    );
}
