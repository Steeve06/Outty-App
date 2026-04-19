import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default tseslint.config(
  tseslint.configs.recommended,
  // CONFIG FOR SERVER & TESTS
  {
    files: ["server/**/*.js", "tests/**/*.js"],
    languageOptions: {
      sourceType: "commonjs", // Allows require()
      globals: globals.node
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn", // Don't block build for unused vars in backend
      "@typescript-eslint/ban-ts-comment": "off"    // Allows @ts-ignore
    }
  },
  // CONFIG FOR APP SCREENS
  {
    files: ["App/**/*.tsx", "App/**/*.ts"],
    plugins: { react: pluginReact },
    languageOptions: { globals: globals.browser },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }] // This allows the _prefix
    }
  }
);