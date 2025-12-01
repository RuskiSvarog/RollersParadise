// Fix all imports by removing version numbers
const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;
      
      // Remove version numbers from imports
      // Example: "@radix-ui/react-slot@1.1.2" -> "@radix-ui/react-slot"
      content = content.replace(/@([a-z0-9\-\/]+)@\d+\.\d+\.\d+/g, '@$1');
      // Example: "lucide-react@0.487.0" -> "lucide-react"
      content = content.replace(/([a-z\-]+)@\d+\.\d+\.\d+/g, '$1');
      
      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
      }
    }
  });
}

console.log('🔧 Fixing all imports...\n');

// Check which directory structure exists
if (fs.existsSync('./src')) {
  fixImports('./src');
}
if (fs.existsSync('./components')) {
  fixImports('./components');
}

console.log('\n✅ All imports fixed!');
console.log('\nNow run:\n  git add .\n  git commit -m "Remove version numbers from imports"\n  git push');