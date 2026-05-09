const { compileFromFile } = require('json-schema-to-typescript')
const fs = require('fs')
const path = require('path')

async function generate() {
  try {
    const ts = await compileFromFile(path.join(__dirname, 'types', 'shift-schema.json'))
    fs.writeFileSync(path.join(__dirname, 'types', 'shift.ts'), ts)
    console.log('Successfully generated shift.ts from JSON schema!')
  } catch (err) {
    console.error('Error generating types:', err)
  }
}

generate()
