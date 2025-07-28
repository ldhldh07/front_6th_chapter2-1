import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        Math: "readonly",
        Date: "readonly",
        parseInt: "readonly",
        Object: "readonly",
      },
    },
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": "warn",
      "no-console": "off",
      semi: ["error", "always"],
    },
  },
];
