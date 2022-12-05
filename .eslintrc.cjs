module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-essential', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue', 'prettier'],
  rules: {
    'vue/component-definition-name-casing': [2, 'kebab-case'],
    'arrow-parens': 0,
    'object-curly-spacing': ['error', 'always'],
    'no-var': 'error',
    'prettier/prettier': [
      'warn',
      {
        vueIndentScriptAndStyle: false,
        printWidth: 80,
        trailingComma: 'all',
        endOfLine: 'auto',
        tabWidth: 2,
        semi: false,
        singleQuote: true,
        bracketSpacing: true,
        bracketSameLine: false,
        arrowParens: 'avoid',
        jsxSingleQuote: true,
      },
    ],
  },
}
