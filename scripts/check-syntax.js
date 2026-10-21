'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const directories = ['js', 'server', 'tests'];
const files = [];

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(fullPath);
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(fullPath);
  }
}

for (const directory of directories) collect(path.join(root, directory));

let failed = false;
for (const file of files) {
  try {
    new vm.Script(fs.readFileSync(file, 'utf8'), { filename: path.relative(root, file) });
  } catch (error) {
    failed = true;
    console.error(`Sintaxis inválida en ${path.relative(root, file)}: ${error.message}`);
  }
}

if (failed) process.exitCode = 1;
else console.log(`Sintaxis correcta en ${files.length} archivos JavaScript.`);
