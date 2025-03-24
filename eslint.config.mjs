// eslint.config.mjs
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    // Specify files to lint, but exclude .next
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      ".next/**", // Ignore all files in .next directory
      "node_modules/**", // Ignore node_modules
      "dist/**", // Ignore any dist directory (if applicable)
      "build/**", // Ignore any build directory (if applicable)
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
      globals: {
        // Define global variables to avoid no-undef errors
        React: "readonly", // For React (used in JSX/TSX files)
        console: "readonly", // For console (used in Node.js)
        process: "readonly", // For process (used in Node.js)
        fetch: "readonly", // For fetch (available in browser/Node.js)
        setTimeout: "readonly", // For setTimeout (available in browser/Node.js)
        document: "readonly", // For document (used in browser)
        Buffer: "readonly", // For Buffer (used in Node.js)
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      // Customize rules to fix no-unused-vars errors
      "no-unused-vars": "off", // Disable base no-unused-vars rule
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }], // Allow unused vars starting with _
    },
  },
];