// Babel config used by Jest only (Next.js uses its own internal Babel config for builds).
// babel-preset-react-app handles TypeScript, React JSX, and modern JS via NODE_ENV=test.
module.exports = {
  presets: [['babel-preset-react-app', { absoluteRuntime: false }]],
}
