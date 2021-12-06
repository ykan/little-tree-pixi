/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs-extra')
const path = require('path')

async function main() {
  const workspace = process.cwd()
  await fs.copy(path.join(workspace, 'assets'), path.join(workspace, 'dist/assets'))
  console.log('copy imgs done.')
}

main()
