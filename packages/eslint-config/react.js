import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import { baseConfig } from "./base.js";

/**
 * React(브라우저) 앱용 공유 ESLint 설정.
 * baseConfig(js/ts recommended + prettier) 위에 react/react-hooks/jsx-a11y를 얹는다.
 * react-jsx 런타임을 쓰므로 React import 강제 규칙은 끈다.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const reactConfig = tseslint.config(
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      // eslint-plugin-react가 아직 ESLint 10을 정식 지원하지 않아 version "detect" 시
      // 내부 getFilename 호출이 깨진다. 버전을 고정해 감지 코드를 우회한다.
      react: {
        version: "17.0",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
);
