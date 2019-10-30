/* eslint-disable import/no-commonjs */

module.exports = {
  rootDir: process.cwd(),
  setupFilesAfterEnv: ['./scripts/setupTests.ts'],
  testPathIgnorePatterns: ['node_modules/', 'dist/'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
