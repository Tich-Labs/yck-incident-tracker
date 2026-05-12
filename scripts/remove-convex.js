const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/app/dashboard/page.tsx',
  'src/pages/incidents/new/page.tsx',
  'src/pages/incidents/page.tsx',
  'src/pages/incidents/detail/page.tsx',
  'src/pages/users/page.tsx',
  'src/pages/reports/page.tsx',
  'src/pages/audit/page.tsx',
  'src/pages/referral/page.tsx',
  'src/pages/admin/services/page.tsx',
  'src/pages/Index.tsx',
  'src/pages/app/_components/AppLayout.tsx',
  'src/hooks/use-offline-incident-queue.ts'
];

const convexPatterns = [
  /import\s+.*\s+from\s+["']convex\/react["'];\s*\n?/g,
  /import\s+\{\s*api\s*\}\s+from\s+["']@\/convex\/_generated\/api\.js["'];\s*\n?/g,
  /import\s+type\s+\{\s*Id\s*\}\s+from\s+["']@\/convex\/_generated\/dataModel\.d\.ts["'];\s*\n?/g,
  /import\s+\{\s*useQuery.*\}\s+from\s+["']convex\/react["'];\s*\n?/g,
  /import\s+\{\s*useConvexAuth.*\}\s+from\s+["']convex\/react["'];\s*\n?/g,
  /import\s+\{\s*Authenticated.*\}\s+from\s+["']convex\/react["'];\s*\n?/g,
  /import\s+\{\s*useAuth\s*\}\s+from\s+["']convex\/react["'];\s*\n?/g,
];

files.forEach(file => {
  const filePath = path.join('/Users/naijeriatowett/Documents/Billion$COnnections/yck/extracted', file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  convexPatterns.forEach(pattern => {
    const newContent = content.replace(pattern, '');
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
  }
});

console.log('Done removing Convex imports!');
