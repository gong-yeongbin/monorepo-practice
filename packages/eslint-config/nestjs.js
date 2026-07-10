import globals from "globals";
import tseslint from "typescript-eslint";
import { baseConfig } from "./base.js";

/**
 * NestJS 앱/패키지용 공유 ESLint 설정 (nest-cli 기본 설정 기반).
 * type-checked 규칙을 사용하며, projectService가 파일별로 가장 가까운 tsconfig를 찾는다.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nestJsConfig = tseslint.config(
  ...baseConfig,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
    },
  },
  // 설정 파일(js/mjs/cjs)은 tsconfig에 포함되지 않으므로 type-checked 규칙을 해제한다.
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      sourceType: "module",
    },
  },
);
