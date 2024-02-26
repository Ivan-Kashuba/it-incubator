/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: './',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 15000,
  testRegex: '.test.ts$',
};
