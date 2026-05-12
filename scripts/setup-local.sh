#!/bin/bash
set -e

echo "=== YCK Incident Tracker - Local Setup ==="

# 1. Navigate to extracted project
cd "/Users/naijeriatowett/Documents/Billion\$COnnections/yck/frontend"

# 2. Remove Hercules/Convex dependencies from package.json
echo "Removing Hercules/Convex packages..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Remove dependencies
delete pkg.dependencies['@usehercules/auth'];
delete pkg.dependencies['@usehercules/sdk'];
delete pkg.dependencies['convex'];

// Remove devDependencies
delete pkg.devDependencies['@convex-dev/eslint-plugin'];
delete pkg.devDependencies['@usehercules/eslint-plugin'];
delete pkg.devDependencies['@usehercules/vite'];

// Remove pnpm specific
delete pkg.pnpm;
if (pkg.scripts) {
  delete pkg.scripts['convex:dev'];
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('package.json updated');
"

# 3. Remove old lock files and node_modules
echo "Cleaning old files..."
rm -rf node_modules pnpm-lock.yaml convex/ convex.json

# 4. Add Supabase dependencies
echo "Adding Supabase..."
npm install @supabase/supabase-js @supabase/auth-helpers-react

# 5. Create basic structure
echo "Creating project structure..."
mkdir -p src/lib src/hooks

# 6. Create .env.local template
cat > .env.local.example << 'EOF'
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# 7. Create Supabase client
cat > src/lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
EOF

echo ""
echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Sign up at supabase.com (free tier)"
echo "2. Create project 'yck-incident-tracker'"
echo "3. Copy URL + anon key from Project Settings → API"
echo "4. Copy .env.local.example to .env.local and fill in values"
echo "5. Run: npm run dev"
