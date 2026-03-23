import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'
import securityPlugin from 'eslint-plugin-security'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: [
      '.next/',
      'out/',
      'node_modules/',
      'coverage/',
      'public/',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'docs/',
      '**/__tests__/',
    ],
  },
  ...tseslint.configs.recommended,
  securityPlugin.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': hooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Disable noisy react-hooks v7 rules
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-render': 'off',
      // Maintainability
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettierConfig,
]
