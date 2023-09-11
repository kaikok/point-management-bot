/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  testRegex: "/__tests__/e2e/.*\\.(test|spec)\\.[jt]sx?$",
};