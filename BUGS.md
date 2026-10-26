# Bugs

Runtime errors and broken behaviour in the YCK Incident Tracker.

Status key: **Fixed** (in working tree, not yet pushed), **Open**, **Verify**.

Last worked: 26 Oct 2026. Verified with `tsc --noEmit` (clean), `npm run lint` (0 errors), `npm run build` (passes), and headless-browser checks of every affected page against demo data.

## Root cause behind most of these

Commit `d09f5ca` ("add missing imports and stubs for Convex migration remnants") replaced real data queries with no-argument stubs. `useSupabaseQuery()` with no `queryFn` returns a permanently-disabled query, so those pages never load. Call sites were never updated. That single regression caused B-05, B-06, B-10, B-11 and B-12.

| ID | Area | Symptom | Cause | Status |
|----|------|---------|-------|--------|
| B-01 | Users page | Blank page; `useSupabaseMutation is not defined` | Missing import in `pages/users/page.tsx` | Fixed |
| B-02 | Admin Manual | Page crashes; `SectionAiAssistant is not defined` | Section referenced but never defined in `pages/admin/manual/page.tsx` | Fixed |
| B-03 | Service worker | `Cache.addAll() failed ... 404`; install fails, offline shell not cached | `public/sw.js` precached root-absolute paths but app is served from `/yck-incident-tracker/` | Fixed (scope-relative paths). Users keep the old worker until the browser updates it; hard reload if needed |
| B-04 | PWA icon | `/icon/icon-192.png` 404 | Root-absolute `src` in `install-prompt.tsx`, plus the scope issue in B-03 | Fixed. Install-prompt icons now use `import.meta.env.BASE_URL`; service worker paths are scope-relative |
| B-05 | Reports | Page showed skeletons forever, no charts | `reportData`, `exportData`, `userProfile` all called `useSupabaseQuery()` with no query | Fixed. Real query added, date range now applied, errors surfaced |
| B-06 | Manage Services | "Access Restricted" or skeletons forever | Same no-arg stubs; plus page routed to a broken copy while a healthier copy sat unused | Fixed for demo (Executive Director sees the list). Still worth a check with a real signed-in admin |
| B-07 | Admin Manual | `404` for an unidentified resource on load | `index.html` linked the manifest as `/site.webmanifest`, which resolves outside the `/yck-incident-tracker/` base and 404s on every page | Fixed (relative `site.webmanifest`). Admin Manual now loads with 0 failed requests |
| B-08 | Deep links | Direct load of `/en/dashboard` returns HTTP 404 (app recovers via `404.html`) | GitHub Pages has no SPA fallback | Open (known limitation; share the root URL) |
| B-09 | Deployment | Live site still runs the broken build | Fixes are local, not pushed | Open |
| B-10 | Audit Log | Always "No activity yet" | `usePaginatedQuery` was a stub returning an empty list | Fixed. Reads `audit_log`, newest first |
| B-11 | Referral directory | Showed "..." / no services | `useSupabaseQuery()` no-arg | Fixed. Shows 8 seeded services in demo |
| B-12 | Users, Manage Services | Save / role / activate / delete buttons threw `x is not a function` | Mutation object invoked directly instead of `.mutateAsync()` | Fixed |
| B-13 | Manage Services, Users | CRUD failed silently or wrote nothing | Mutations used `referralServices` instead of `referral_services`, and `isActive` instead of `is_active` | Fixed |
| B-14 | Referral, Manage Services, Audit | React keys and edit/delete targets were `undefined` | Convex `_id` remnants instead of Supabase `id` | Fixed |
| B-15 | Incidents list | Header always said "All logged incidents" and the volunteer view was wrong | Read the users *list* instead of the current user | Fixed |
| B-16 | Demo data | Charts showed raw age groups (`18-24`), and every demo incident had today's date so date filters did nothing | Demo values did not match app enums; dates not derived from `createdAt` | Fixed |
| B-17 | Repo | `pages/admin/services/AdminServicesInner.tsx` was an orphaned file with no imports, failing typecheck | Leftover from a merge | Removed (the live page defines its own component) |
| B-18 | Types | 46 TypeScript errors, mostly `Property 'x' does not exist on type 'unknown'` | Untyped `useSupabaseQueryCamel` calls | Fixed; `tsc --noEmit` is now clean |

## Verification done

- `npx tsc --noEmit`: clean.
- `npm run lint`: 0 errors, 3 pre-existing `react-refresh` warnings.
- `npm run build`: passes.
- Headless browser (demo mode, no Supabase session):
  - `/en/referral`: 8 services, 8 phone links, 0 console errors.
  - `/en/reports`: 12 incidents this month, 9 in the last 7 days (filter works), 6 charts, 0 skeletons.
  - `/en/audit`: entries render.
  - `/en/users`: demo users render, 0 skeletons.
  - `/en/admin/services`: 8 services, Add Service button, 0 skeletons.
  - `/en/incidents`, `/en/dashboard`: render, 0 skeletons, 0 console errors.

## Not tested

- Writes (`createService`, `updateService`, `deleteService`, role/active changes, audit inserts) need a real Supabase session. Columns and table names were corrected against `supabase/schema.sql`, but no live write has been exercised.
- B-06 with a real signed-in non-demo account.
- Offline behaviour after the service-worker fix.
