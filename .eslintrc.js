module.exports = {
    "env": {
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "extends": ["plugin:@atlassian/incredible/recommended"],
    "root": true,
    "rules":{
        "jest/no-deprecated-functions": "off" // we're using vitest not jest. see MES-363 to add vitest support to incredible
    },
};
