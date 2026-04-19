import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default tseslint.config(
  // Global recommended rules
  tseslint.configs.recommended,

  // 1. BACKEND & TESTS (Allow CommonJS and turn off TS-specific restrictions)
  {
    files: ["server/**/*.js", "tests/**/*.js", "**/__tests__/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node, ...globals.jest }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unused-vars": "warn", // Change to warn so it doesn't block builds
      "@typescript-eslint/no-explicit-any": "off"
    }
  },

  // 2. FRONTEND (React Native / TypeScript)
  {
    files: ["App/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser
    },
    plugins: {
      react: pluginReact
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed in modern React
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }] // Allows single quotes in text
    }
  }
);