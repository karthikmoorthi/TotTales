# TotTales revival status

## Completed locally

- Removed the Gemini SDK, API-key path, scripts, and preview-generation admin screen.
- Added authenticated, server-side OpenAI text and image Edge Functions.
- Added reference-photo image editing for visual consistency.
- Added email/password authentication and made Google OAuth optional.
- Fixed generation navigation so the progress screen owns the running job.
- Replaced handwritten database types with types generated from the live project.
- Added lint configuration and repaired TypeScript errors.
- Added an idempotent recovery migration for seed data, buckets, RLS, function permissions, and missing indexes.

## External setup still required

- Explicit approval to apply `004_revival_baseline.sql` to the live Supabase project.
- An OpenAI API key stored as a Supabase secret, followed by Edge Function deployment.
- Review or recreate Google OAuth client IDs if Google sign-in is desired.
- Enable Supabase leaked-password protection in the Auth dashboard.

## Pre-launch work

- Upgrade from Expo SDK 52 after the revival build is stable.
- Move the complete multi-minute generation job off the device into a durable server job.
- Make generated story images private or add an intentional sharing model.
- Add parental consent, privacy policy, retention/deletion controls, cost limits, tests, CI, and production observability.
