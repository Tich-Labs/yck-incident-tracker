#!/bin/bash
# Replace all Convex imports with Supabase in the extracted project
cd "/Users/naijeriatowett/Documents/Billion\$COnnections/yck/frontend"

echo "=== Replacing Convex Imports ==="

# Files to update
files=(
  "src/pages/app/dashboard/page.tsx"
  "src/pages/incidents/new/page.tsx"
  "src/pages/incidents/page.tsx"
  "src/pages/incidents/detail/page.tsx"
  "src/pages/users/page.tsx"
  "src/pages/reports/page.tsx"
  "src/pages/audit/page.tsx"
  "src/pages/referral/page.tsx"
  "src/pages/admin/services/page.tsx"
  "src/pages/Index.tsx"
  "src/pages/app/_components/AppLayout.tsx"
  "src/hooks/use-offline-incident-queue.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    # Remove Convex imports
    sed -i '' '/from "convex\/react"/d' "$file"
    sed -i '' '/from "@/convex\/_generated\/api\.js"/d' "$file"
    sed -i '' '/from "@/convex\/_generated\/dataModel\.d\.ts"/d' "$file"
    sed -i '' '/import { api }/d' "$file"
    sed -i '' '/import { useQuery, useMutation, usePaginatedQuery }/d' "$file"
    sed -i '' '/import { Authenticated, Unauthenticated, AuthLoading, useQuery }/d' "$file"
    sed -i '' '/import { useConvexAuth, useMutation }/d' "$file"
    sed -i '' '/import { useAuth } from "convex/react"/d' "$file"
  fi
done

echo "=== Adding Supabase Imports (Manual Step Required) ==="
echo "Files updated. You'll need to manually add Supabase imports to each file."
echo "Example: import { useSupabaseQuery } from '@/hooks/use-supabase-query'"

# Remove convex directory if still present
rm -rf convex/

echo "Done! Convex imports removed."
