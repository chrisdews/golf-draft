// When NODE_ENV=test (Jest), use babel-preset-react-app for TS/JSX transforms.
// For all other environments (Next.js build/dev), use next/babel so ESM helpers resolve correctly.
module.exports = (api) => {
  const isTest = api.env('test')
  return {
    presets: isTest
      ? [['babel-preset-react-app', { absoluteRuntime: false }]]
      : ['next/babel'],
  }
}
