const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'presentation', 'pages');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
    const fullPath = path.join(srcDir, f);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix syntax error: "'{t('something')}'" -> "t('something')"
    // and '"{t('something')}"' -> "t('something')"
    // Note: since the string replacement replaced things literally, it looks like:
    // '{t('common.delete')}' or "{t('common.delete')}"
    content = content.replace(/'\{t\('([^']+)'\)\}'/g, "t('$1')");
    content = content.replace(/"\{t\('([^']+)'\)\}"/g, "t('$1')");

    fs.writeFileSync(fullPath, content);
});
console.log('Fixed quotes around translations');
