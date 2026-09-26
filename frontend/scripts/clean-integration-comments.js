import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

const regex = /\/\*[\s\S]*?\[BACKEND_INTEGRATION_POINT\][\s\S]*?\*\/[\r\n]*/g;

let totalCleaned = 0;
let filesModified = 0;

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        const cleanedContent = content.replace(regex, '');
        fs.writeFileSync(fullPath, cleanedContent, 'utf8');
        const rel = path.relative(srcDir, fullPath);
        console.log(`Cleaned ${matches.length} integration points from: src/${rel}`);
        totalCleaned += matches.length;
        filesModified += 1;
      }
    }
  }
}

walkDir(srcDir);
console.log(`\nDone! Removed ${totalCleaned} integration comments across ${filesModified} files.`);
