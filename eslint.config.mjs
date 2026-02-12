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
  ...tseslint.configs.recommendedTypeChecked,
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
        project: "./tsconfig.app.json",
        extraFileExtensions: [".vue"],
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
  eslintConfigPrettier,
];
