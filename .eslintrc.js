module.exports = {
  root: true,
  extends: "standard",
  env: {
    node: true,
    mocha: true
  },
  globals: {
    requireRoot: true,
    expect: true
  },
  plugins: [
    "mocha",
    "chai-friendly"
  ],
  rules: {
    "indent": [2, "tab"],
    "no-tabs": ["error", { allowIndentationTabs: true }],
    "comma-dangle": ["error", "always-multiline"],
    "mocha/no-exclusive-tests": "error",
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2
  }
}
