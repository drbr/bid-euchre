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
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
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
