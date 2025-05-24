const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/Testimonials.js',
  'src/pages/RegionalGuides.js',
  'src/pages/PropertyListings.js',
  'src/pages/News.js',
  'src/pages/Contact.js',
  'src/pages/Agencies.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add config import if not present
  if (!content.includes("import config from '../config'")) {
    content = content.replace(
      /import.*?from.*?;(\r?\n|\r)/,
      match => `import config from '../config';\n${match}`
    );
  }
  
  // Replace hardcoded URLs
  content = content.replace(
    /http:\/\/localhost:5000/g,
    '${config.apiUrl}'
  );
  
  // If using template literal, ensure it's properly wrapped in backticks
  content = content.replace(
    /['"](\${config\.apiUrl}.*?)['"]/, 
    '`$1`'
  );
  
  fs.writeFileSync(filePath, content);
});
