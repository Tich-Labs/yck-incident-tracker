const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/reports/page.tsx',
  'src/pages/users/page.tsx',
  'src/pages/incidents/new/page.tsx',
  'src/pages/incidents/page.tsx',
  'src/pages/incidents/detail/page.tsx',
  'src/pages/app/dashboard/page.tsx',
  'src/pages/app/_components/AppLayout.tsx',
  'src/pages/referral/page.tsx',
  'src/pages/admin/services/page.tsx',
  'src/pages/audit/page.tsx',
  'src/pages/Index.tsx',
  'src/hooks/use-offline-incident-queue.ts'
];

// Replacements map
const replacements = [
  // Convex imports
  [/import\s+\{\s*Id<"users">\s*\}\s*;/g, ''],
  [/import\s+\{\s*ConvexError\s*\}\s+from\s+["']convex\/values["'];?\s*\n?/g, ''],
  [/useQuery\(api\.\w+\.\w+,?[^)]*\)/g, 'useSupabaseQuery()'],  // Simplified
  [/useMutation\(api\.\w+\.\w+,?[^)]*\)/g, 'useSupabaseMutation()'], // Simplified
  [/api\.\w+\.\w+/g, 'null'], // Remove api references for now
  [/interface\s+\w+\{\s*_id:\s*Id<"[^"]+">;?\s*\}/g, 'interface $1 { _id: string; }'],
  [/_id:\s*Id<"[^"]+">/g, '_id: string'],
  [/import\s+\{\s*Authenticated[^}]*\}\s+from\s+["']convex\/react["'];?\s*\n?/g, "import { Authenticated, Unauthenticated, AuthLoading } from '@/components/auth-components';"],
  [/import\s+\{\s*useQuery[^}]*\}\s+from\s+["']convex\/react["'];?\s*\n?/g, "import { useSupabaseQuery } from '@/hooks/use-supabase-query';"],
  [/import\s+\{\s*useMutation[^}]*\}\s+from\s+["']convex\/react["'];?\s*\n?/g, "import { useSupabaseMutation } from '@/hooks/use-supabase-query';"],
];

files.forEach(file => {
  const filePath = path.join('/Users/naijeriatowett/Documents/Billion$COnnections/yck/extracted', file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  replacements.forEach(([pattern, replacement]) => {
    const newContent = content.replace(pattern, replacement);
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

console.log('\nDone! Remaining Convex references removed.');
console.log('NOTE: You will need to manually update the Supabase query/mutation calls to match your actual data structure.');
