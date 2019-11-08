/* eslint-disable import/no-commonjs */

const fs = require('fs');
const path = require('path');

module.exports = {
  mergeStrategy: {
    toSameBranch: ['next'],
  },
  versionUpdated: ({ version, dir }) => {
    // Bump the string version in the version file
    const versionPath = path.resolve(dir, 'src/version.ts');
    fs.writeFileSync(versionPath, `export const version = '${version}';\n`);
  },
};
