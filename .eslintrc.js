// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  ignorePatterns: ["apps/**", "packages/**"],
  extends: ["@empiricalrun/eslint-config/library.js"],
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js?(x)",
    "node_modules/",
    "examples/"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
