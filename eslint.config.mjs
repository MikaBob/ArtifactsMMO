import eslint from '@eslint/js'
import eslintParser from '@typescript-eslint/parser'
import eslintPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import prettier from 'prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
    files: ['**/*.{ts,tsx}'],
    rules: {
        'no-console': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
    },
    languageOptions: {
        ecmaVersion: 2022,
        parser: eslintParser,
        sourceType: 'module',
        globals: {
            ...globals.browser,
            ...globals.node,
            myCustomGlobal: 'readonly',
        },
    },
    plugins: {
        eslintPlugin: eslintPlugin,
        prettier: prettier,
    },
})
