import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

import quality from "./eslint-rules/index.cjs";

export default defineConfig([
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
      globals: {
        console: "readonly",
        process: "readonly",
        fetch: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLDivElement: "readonly",
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.strict,

  {
    plugins: { "import-x": importX },
    settings: {
      "import-x/resolver-next": [createTypeScriptImportResolver()],
    },
    rules: {
      "import-x/no-duplicates": "error",
      "import-x/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: ["./src/components/**/*", "./src/pages/**/*"],
              from: "./src/integrations/supabase/client.ts",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/**/*.{tsx,jsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    settings: {
      react: { version: "18.3" },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/jsx-key": "warn",
      "react/no-array-index-key": "warn",
      "react/jsx-no-target-blank": "warn",
      "react/no-danger": "warn",
      "react/jsx-no-leaked-render": [
        "error",
        { validStrategies: ["ternary", "coerce"] },
      ],
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
    },
  },

  {
    files: ["src/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: { quality },
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-var": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      complexity: ["warn", 12],
      "max-depth": ["warn", 4],
      "max-statements": ["warn", 20],
      "max-params": ["warn", 4],
      "max-lines-per-function": [
        "warn",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
      "max-nested-callbacks": ["warn", 3],

      "quality/max-lines": ["error", { max: 350 }],
      // baseline: 13 violations (console usage across application code)
      "quality/no-direct-console": [
        "warn",
        { logger: "the project logging helper" },
      ],
      "quality/no-direct-data-access": [
        "error",
        {
          modules: [
            "@/integrations/supabase/client",
            "@/integrations/supabase/client.ts",
            "src/integrations/supabase/client",
          ],
          bindings: ["supabase"],
          layers: ["/src/components/", "/src/pages/"],
          extensions: [".tsx"],
        },
      ],
    },
  },

  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/{__tests__,__mocks__,fixtures,mocks}/**/*.{ts,tsx}",
    ],
    plugins: { quality },
    rules: {
      "quality/max-lines": ["warn", { includeTests: true }],
      "quality/no-direct-console": "off",
    },
  },

  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "max-statements": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
      "import-x/no-restricted-paths": "off",
    },
  },

  {
    files: ["eslint-rules/**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { module: "readonly", require: "readonly" },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  globalIgnores([
    ".claude/**",
    ".gemini/**",
    "node_modules/**",
    "dist/**",
    "build/**",
    "coverage/**",
    "**/*.tsbuildinfo",
    "package-lock.json",
  ]),
]);
