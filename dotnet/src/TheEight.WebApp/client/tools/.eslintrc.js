module.exports = {
  "env": {
    "browser": true
  },
  "parser": "babel-eslint",
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 7,
    "sourceType": "module",
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    }
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "windows"],
    "quotes": ["error", "double"],
    "semi": ["error", "never"]
  }
}
