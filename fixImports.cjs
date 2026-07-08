const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'presentation', 'pages');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
    const fullPath = path.join(srcDir, f);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix syntax error
    content = content.replace("import React\nimport { useTranslation } from 'react-i18next';, ", "import React, ");
    content = content.replace("import React\r\nimport { useTranslation } from 'react-i18next';, ", "import React, ");
    
    // Add useTranslation safely if not exists
    if (!content.includes("import { useTranslation } from 'react-i18next';")) {
        content = content.replace("import React,", "import React,\nimport { useTranslation } from 'react-i18next';\nimport ");
    }
    
    fs.writeFileSync(fullPath, content);
});
console.log('Fixed imports');
