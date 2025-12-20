// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    ignores: ['eslint.config.ts'],
  },

  // Regras base do ESLint
  eslint.configs.recommended,

  // Regras recomendadas para TypeScript (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  // Integração com Prettier
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs', // NestJS usa CommonJS por padrão
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      // Segurança real
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Ruído → warn
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Produtividade
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
);
