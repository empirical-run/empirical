// const withTM = require("next-transpile-modules")([
//   "@duckdb/react-duckdb",
//   "xterm",
// ]);
/** @type {import('next').NextConfig} */
module.exports = {
  output: "export",
  distDir: "../../packages/cli/dist/webapp",
  productionBrowserSourceMaps: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  optimizeFonts: false,
  webpack: function (config, { isServer, dev }) {
    config.output.webassemblyModuleFilename =
      isServer && !dev
        ? "..static/wasm/[name].[moduleHash].wasm"
        : "static/wasm/[name].[moduleHash].wasm";
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    config.module.rules.push({
      test: /.*\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[name].[contenthash][ext]",
      },
    });

    return config;
  },
};
