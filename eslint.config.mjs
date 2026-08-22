import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier";
import sonarjs from "eslint-plugin-sonarjs";

export default [
  {
    ignores: ["dist", "node_modules", "**/*.js"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  sonarjs.configs.recommended,
  {
    files: ["src/**/*.{vue,ts}"],
    plugins: {
      "typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: "module",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-unused-vars": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "sonarjs/no-commented-code": "off",
      "sonarjs/void-use": "off",
      "no-useless-assignment": "warn",
    },
  },
  {
    files: ["src/**/*.vue"],
    rules: {
      // Disabled for Vue SFCs: script setup variables used only in templates
      // are falsely reported as useless assignments
      "no-useless-assignment": "off",
    },
  },
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Audited both findings: each compares a named constant with its own literal (0.5,
      // 0.2). No arithmetic is involved, so the comparison is exact, and rewriting a pinned
      // constant as a range would weaken what the test is for.
      "sonarjs/no-floating-point-equality": "off",
    },
  },
  {
    files: ["test/e2e/**/*.ts"],
    rules: {
      // Off pending a rewrite of these specs rather than of the waits. Each fixed wait sits
      // in front of an assertion that cannot observe what the wait is for — `svg` is visible
      // both before and after the icon changes — so dropping the wait would hide the weak
      // assertion instead of fixing it.
      "sonarjs/no-fixed-wait-in-tests": "off",
    },
  },
  eslintConfigPrettier,
];
