import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'dist-ssr', 'node_modules', 'public', '.wrangler'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Apagada a propósito: marca los patrones de hidratación del SSG (leer localStorage/URL o
      // `mounted` recién en el cliente). Sacarla obliga a refactorizar a useSyncExternalStore y
      // tocaría la lógica de test-hiit, que no se cambia.
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Protocolo de investigación: no se toca su lógica. performance.now() está en un manejador
    // de eventos (onAnswer), no en el render: falso positivo de la regla.
    files: ['src/features/test-hiit/**'],
    rules: { 'react-hooks/purity': 'off' },
  },
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } },
  },
);
