# TotTales - Project Context

## Overview
TotTales is a React Native mobile app that creates personalized AI-generated storybooks where toddlers are the heroes. Parents upload photos of their child, select a theme and art style, and AI generates a complete illustrated storybook.

## Tech Stack
- **Frontend**: React Native with Expo SDK 52, Expo Router for navigation
- **Backend**: Supabase (Auth, PostgreSQL Database, Storage)
- **AI**: OpenAI behind authenticated Supabase Edge Functions
- **State**: React Query for server state, React Context for app state

## Project Structure
```
TotTales/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login, callback
│   ├── (main)/            # Protected routes
│   │   ├── create/        # Story creation flow (4 steps)
│   │   ├── read/          # Story reader
│   │   └── library/       # User's stories
├── src/
│   ├── components/
│   │   ├── ui/            # Button, Card, Input, Header, etc.
│   │   ├── creation/      # PhotoUploader, ThemeSelector, etc.
│   │   └── story/         # StoryReader, StoryPage (has .web.tsx variant)
│   ├── services/
│   │   ├── supabase/      # client, auth, storage, database
│   │   └── ai/            # OpenAI client, agents, image generation, orchestration
│   ├── hooks/             # useStories, useChildren, useThemesAndStyles
│   ├── contexts/          # AuthContext, StoryCreationContext
│   ├── types/             # TypeScript types, database schema
│   └── utils/             # constants, helpers
└── supabase/migrations/   # Database schema and seed data
```

## Key Files
- `src/services/ai/storyOrchestrator.ts` - Main story generation flow
- `src/services/ai/characterConsistency.ts` - Analyzes child photos for AI consistency
- `src/components/story/StoryReader.tsx` - Native version (PagerView)
- `src/components/story/StoryReader.web.tsx` - Web version (ScrollView)
- `supabase/migrations/001_initial_schema.sql` - Database tables & RLS policies
- `supabase/migrations/002_seed_data.sql` - Themes and art styles

## Database Schema
- **profiles** - User accounts (auto-created on Google sign-in)
- **children** - Child info + photos + AI-generated character description
- **themes** - 8 story themes (Space, Underwater, Dinosaurs, etc.)
- **art_styles** - 6 visual styles (Watercolor, Cartoon, etc.)
- **stories** - Generated storybooks with status tracking
- **story_pages** - Individual pages with text and image URLs

## Environment Variables (.env)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
# OPENAI_API_KEY is a Supabase server secret, never an Expo variable.
```

## Story Generation Flow
1. User uploads 1-5 photos of child
2. The server-side OpenAI provider analyzes photos → generates character description
3. User selects theme and art style
4. The agent loop generates a 10-page narrative with scene descriptions
5. GPT Image generates an illustration for each page
6. Images uploaded to Supabase Storage
7. Story marked complete, user can read

## Platform-Specific Code
- `StoryReader.web.tsx` uses ScrollView (web doesn't support PagerView)
- `StoryReader.tsx` uses react-native-pager-view (native only)
- Metro automatically resolves `.web.tsx` files on web platform

## Common Commands
```bash
npm start              # Start Expo dev server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npx expo start --clear  # Clear cache and start
```

## Known Limitations
- Android OAuth requires SHA-1 fingerprint (not configured yet)
- Web has limited testing (OAuth redirect may need adjustment)
- AI generation remains disabled until the OpenAI secret and Edge Functions are configured

## Debugging Tips
- Check Expo server logs for bundling errors
- Supabase Dashboard → Logs for database/auth issues
- Browser DevTools Console for web-specific errors
- RLS policies may block queries - check user authentication state
