module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "tsconfigRootDir": __dirname,
    "sourceType": "module",
  },
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:@typescript-eslint/recommended",
  ],
  "rules": {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
  },
  "overrides": [
    {
      "files": ["**/*.ts?(x)"],
      "rules": {
        "@typescript-eslint/no-floating-promises": "warn",
        "@typescript-eslint/explicit-module-boundary-types": "off",
      }
    }
  ]
}
