module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  ignorePatterns: [
    "node_modules/",
    "**/dist/",
    "**/coverage/",
    ".expo/",
    "android/",
    "ios/",
  ],
  rules: {
    "no-debugger": "error",
    "no-duplicate-imports": "error",
    "no-unreachable": "error",
    "no-constant-condition": ["error", { checkLoops: false }],
  },
};
