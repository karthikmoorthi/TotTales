# TotTales

An Expo/React Native app for creating personalized, illustrated children's stories.

## Current revival status

- Supabase email/password authentication is supported; Google sign-in is optional.
- Story and image requests go through authenticated Supabase Edge Functions.
- No AI provider key is included in the mobile or web bundle.
- OpenAI is the only planned AI provider. The functions return a clear `503` until `OPENAI_API_KEY` is configured.
- The app creates a ten-page story through an Architect → Wordsmith → Critic loop, then generates page illustrations using the child's reference photos.

## Stack

- Expo SDK 52 and Expo Router
- React Native / React Native Web
- Supabase Auth, Postgres, Storage, and Edge Functions
- OpenAI Responses API for text/vision and GPT Image for illustrations
- TanStack Query for server state

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Add the Supabase project URL and an active publishable key. Google client IDs are optional.

4. Apply the migrations in `supabase/migrations` in order. Existing installations should apply `004_revival_baseline.sql`; it restores the catalog and buckets idempotently and hardens the original policies.

5. Deploy both authenticated Edge Functions:

   ```bash
   supabase functions deploy openai-text
   supabase functions deploy openai-image
   ```

6. Configure the OpenAI key as a server secret—never as an `EXPO_PUBLIC_*` value:

   ```bash
   supabase secrets set OPENAI_API_KEY=...
   ```

   Optional server-only overrides are `OPENAI_TEXT_MODEL` and `OPENAI_IMAGE_MODEL`.

7. Start the app:

   ```bash
   npm start
   ```

## Verification

```bash
npm run typecheck
npm run lint
npx expo export --platform web
```

## Important privacy boundary

Child photos are stored in the private `child-photos` bucket. During generation, up to three photos are downloaded by the signed-in app and sent through an authenticated Edge Function to OpenAI for character analysis and illustration reference. Do not launch publicly until the privacy policy, parental consent language, retention/deletion behavior, and generated story-image visibility have been reviewed.

## Project map

- `app/` — screens and navigation
- `src/services/ai/` — provider-neutral orchestration and OpenAI function clients
- `src/services/supabase/` — auth, database, and storage access
- `supabase/functions/` — server-side OpenAI calls
- `supabase/migrations/` — schema, catalog, storage, and policy setup
- `docs/STORY_GENERATION.md` — generation architecture

OpenAI references: [Responses API](https://developers.openai.com/api/reference/responses), [image generation guide](https://developers.openai.com/api/docs/guides/image-generation), and [GPT Image 2](https://developers.openai.com/api/docs/models/gpt-image-2).
