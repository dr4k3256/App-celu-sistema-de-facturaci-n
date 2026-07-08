const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'presentation', 'pages');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
    const fullPath = path.join(srcDir, f);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix syntax error: "title=t('...')" -> "title={t('...')}"
    content = content.replace(/=t\('([^']+)'\)/g, "={t('$1')}");

    fs.writeFileSync(fullPath, content);
});
console.log('Fixed missing curly braces around t() properties');
