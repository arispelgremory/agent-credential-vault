// const withNextIntl = require("next-intl/plugin")(
//     // This is the default (also the `src` folder is supported out of the box)
//     "./i18n.ts"
// );

// module.exports = withNextIntl({
//     reactStrictMode: false,
//     crossOrigin: "anonymous",
//     eslint: {
//         // Warning: This allows production builds to successfully complete even if
//         // your project has ESLint errors.
//         ignoreDuringBuilds: false,
//     },
//     images: {
//         domains: ["103.224.93.109", "media1.tenor.com"],
//     },
// });

const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    crossOrigin: "anonymous",
    compiler: {
        styledComponents: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "103.224.93.109",
            },
            {
                protocol: "https",
                hostname: "media1.tenor.com",
            },
        ],
    },
    // Override the default webpack configuration
    webpack: (config) => {
        // See https://webpack.js.org/configuration/resolve/#resolvealias
        config.resolve.alias = {
            ...config.resolve.alias,
            "sharp$": false,
            "onnxruntime-node$": false,
        }
        return config;
    },
};

module.exports = withNextIntl(nextConfig);
