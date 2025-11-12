const fs = require('fs');
const path = require('path');
let acorn;
try {
  acorn = require('acorn');
} catch (e) {
  console.error('Missing dependency: please run `npm install acorn` in the project root');
  process.exit(2);
}

function walk(dir){
  const results = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
    const res = path.join(dir, d.name);
    if (d.isDirectory()) {
      // skip node_modules and .git
      if (d.name === 'node_modules' || d.name === '.git') return;
      results.push(...walk(res));
    } else if (d.isFile() && res.endsWith('.js')) results.push(res);
  });
  return results;
}

const root = path.resolve(__dirname, '..');
const files = walk(root);
let errors = 0;
files.forEach(f => {
  const rel = f.replace(root + path.sep, '');
  try{
    const src = fs.readFileSync(f, 'utf8');
    // parse as an ES module to accept import/export syntax
    acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' });
    console.log('OK', rel);
  }catch(err){
    errors++;
    console.error('ERROR', rel, (err && err.message) || err);
  }
});
if (errors) process.exit(1);
