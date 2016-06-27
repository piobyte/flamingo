module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "rules": {
    "no-var": 2,
    'no-console': 0,
    'no-multi-spaces': 2,
    'indent': ['error', 2, {"SwitchCase": 1}],
    "one-var": ["error", "never"],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-unused-vars": ["error", {"args": "none"}],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
  }
};
