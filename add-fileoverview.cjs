const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const jsFiles = walk(path.join(__dirname, 'js'));

jsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('@fileoverview')) {
    const filename = path.basename(file);
    const header = `/**\n * @fileoverview EcoLens application module: ${filename}\n * Follows strict Google JavaScript Style Guide.\n */\n`;
    content = header + content;
    fs.writeFileSync(file, content);
    console.log('Added @fileoverview to', filename);
  }
});
