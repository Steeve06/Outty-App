import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default tseslint.config(
  // 1. Setup for your Node.js Backend (CommonJS)
  { 
    files: ["server/**/*.js"], 
    languageOptions: { 
      sourceType: "commonjs",
      globals: globals.node 
    } 
  },
  // 2. Setup for your React Native/TypeScript Frontend
  { 
    files: ["App/**/*.{ts,tsx}"], 
    languageOptions: { 
      globals: globals.browser 
    },
    plugins: {
      react: pluginReact
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
    }
  },
  tseslint.configs.recommended,
);