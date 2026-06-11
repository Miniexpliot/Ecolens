import js from "@eslint/js";

export default [
  {
    ignores: ["scratch/**", "coverage/**"]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        localStorage: "readonly",
        Event: "readonly",
        THREE: "readonly",
        Math: "readonly",
        parseFloat: "readonly",
        Number: "readonly",
        IntersectionObserver: "readonly",
        DOMParser: "readonly",
        Node: "readonly",
        Array: "readonly",
        Object: "readonly",
        performance: "readonly",
        setTimeout: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        customElements: "readonly",
        HTMLElement: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "eqeqeq": "error",
      "prefer-const": "error",
      "no-var": "error"
    }
  }
];
