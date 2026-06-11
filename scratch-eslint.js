import eslint from 'eslint';

const cli = new eslint.ESLint({
  overrideConfig: {
    extends: ['google'],
    env: { browser: true, es2021: true },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'require-jsdoc': 'off' // We will look at structural rules mostly, JSDoc is already good but google might complain about missing @fileoverview
    }
  },
  useEslintrc: false
});

async function run() {
  const results = await cli.lintFiles(['js/**/*.js']);
  const formatter = await cli.loadFormatter('stylish');
  const resultText = formatter.format(results);
  console.log(resultText);
}

run().catch(console.error);
