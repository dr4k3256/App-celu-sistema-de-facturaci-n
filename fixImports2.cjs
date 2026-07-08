const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'presentation', 'pages');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
    const fullPath = path.join(srcDir, f);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix syntax error: "import React,\nimport { useTranslation"
    content = content.replace("import React,\nimport { useTranslation } from 'react-i18next';\nimport ", "import React from 'react';\nimport { useTranslation } from 'react-i18next';\nimport ");
    content = content.replace("import React,\r\nimport { useTranslation } from 'react-i18next';\r\nimport ", "import React from 'react';\nimport { useTranslation } from 'react-i18next';\nimport ");
    content = content.replace("import React,\nimport { useTranslation } from 'react-i18next';\nimport", "import React from 'react';\nimport { useTranslation } from 'react-i18next';\nimport");
    
    fs.writeFileSync(fullPath, content);
});
console.log('Fixed imports 2');
