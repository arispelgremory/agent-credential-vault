// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    /*
     * Serverside Environment variables, not available on the client.
     * Will throw if you access these variables on the client.
     */
    server: {
        // API_URL: z.url().optional(),
    },
    /*
     * Environment variables available on the client (and server).
     *
     * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
     */
    client: {
        NEXT_PUBLIC_API_URL: z.url(),
        NEXT_PUBLIC_INBOUND_TOPIC_ID: z.string().optional(),
        NEXT_PUBLIC_OUTBOUND_TOPIC_ID: z.string().optional(),
    },
    /*
     * Due to how Next.js bundles environment variables on Edge and Client,
     * we need to manually destructure them to make sure all are included in bundle.
     *
     * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
     */
    runtimeEnv: {
        // API_URL: process.env.API_URL,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_INBOUND_TOPIC_ID: process.env.NEXT_PUBLIC_INBOUND_TOPIC_ID,
        NEXT_PUBLIC_OUTBOUND_TOPIC_ID: process.env.NEXT_PUBLIC_OUTBOUND_TOPIC_ID,
    },
    /*
     * Makes it so empty strings are treated as undefined.
     * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /*
     * By default, this library will feed the environment variables directly to
     * the Zod validator.
     *
     * This means that if you have an empty string for a value that is supposed
     * to not be empty, it will fail validation. This is helpful for catching
     * errors early.
     */
    emptyStringAsUndefined: true,
});
