const fs = require('fs');
const path = require('path');

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Convert require to import
  content = content.replace(/const\s+([a-zA-Z0-9_]+)\s+=\s+require\(['"]([^'"]+)['"]\);?/g, "import $1 from '$2';");
  
  // Convert destructured require to import
  content = content.replace(/const\s+\{\s*([^}]+)\s*\}\s+=\s+require\(['"]([^'"]+)['"]\);?/g, "import { $1 } from '$2';");
  
  // Convert module.exports to export default
  content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);?/g, 'export default $1;');
  
  // Convert exports.xxx to export const xxx
  content = content.replace(/exports\.([a-zA-Z0-9_]+)\s*=/g, 'export const $1 =');
  
  // Add types to function parameters (basic any types)
  content = content.replace(/async\s*\(\s*req\s*,\s*res\s*,\s*next\s*\)/g, 'async (req: any, res: any, next: any)');
  content = content.replace(/\(\s*req\s*,\s*res\s*,\s*next\s*\)\s*=>/g, '(req: any, res: any, next: any) =>');
  
  // Fix common mongoose types
  content = content.replace(/:\s*any\s*,\s*limit\s*=/g, ': any, limit =');
  
  fs.writeFileSync(filePath, content);
  console.log(`Converted: ${filePath}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      const newPath = fullPath.replace('.js', '.ts');
      fs.renameSync(fullPath, newPath);
      convertFile(newPath);
    }
  }
}

const targetDir = process.argv[2] || './backend/src';
processDirectory(targetDir);
console.log('Conversion complete!');
