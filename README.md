# TotTales

A React Native mobile app that creates personalized AI-generated storybooks where toddlers are the heroes.

## Features

- **Google OAuth Authentication** - Secure sign-in with Google
- **Photo Upload** - Add photos of your child for personalized illustrations
- **Theme Selection** - Choose from adventures like Space, Underwater, Enchanted Forest, and more
- **Art Style Selection** - Pick from watercolor, cartoon, classic storybook, and other styles
- **AI Story Generation** - Stories crafted by Google Gemini with your child as the protagonist
- **AI Illustrations** - Each page features a unique illustration with your child
- **Swipeable Reader** - Intuitive page-by-page reading experience
- **Regenerate Pages** - Not happy with an illustration? Regenerate it!
- **Story Library** - Access all your created stories anytime

## Tech Stack

- **Frontend**: React Native with Expo (SDK 52)
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Google Gemini (narrative + image generation)
- **State Management**: Zustand + React Query
- **Navigation**: Expo Router

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier works)
- Google Cloud Console project (for OAuth + Gemini API)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migrations:
   - Go to SQL Editor in Supabase Dashboard
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_seed_data.sql`
3. Configure Google OAuth:
   - Go to Authentication > Providers > Google
   - Enable Google provider
   - Add your Google OAuth credentials

### 3. Configure Google Cloud

1. Create a project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable these APIs:
   - Generative Language API (Gemini)
3. Create OAuth 2.0 credentials:
   - Create credentials for iOS, Android, and Web
4. Create an API key for Gemini

### 4. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Web client ID
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` - Google OAuth iOS client ID
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` - Google OAuth Android client ID
- `EXPO_PUBLIC_GEMINI_API_KEY` - Google Gemini API key

### 5. Add App Icons

Replace the placeholder files in `/assets`:
- `icon.png` (1024x1024) - App icon
- `splash.png` (1284x2778) - Splash screen
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (32x32) - Web favicon

### 6. Run the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Project Structure

```
TotTales/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication screens
│   ├── (main)/                   # Main app screens
│   │   ├── create/               # Story creation flow
│   │   ├── read/                 # Story reading
│   │   └── library/              # User's story library
│   └── _layout.tsx               # Root layout
├── src/
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   ├── story/                # Story reader components
│   │   └── creation/             # Story creation components
│   ├── services/
│   │   ├── supabase/             # Supabase client & operations
│   │   └── ai/                   # Gemini API integration
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                 # React contexts
│   ├── types/                    # TypeScript types
│   └── utils/                    # Utility functions
└── supabase/
    └── migrations/               # Database migrations
```

## Database Schema

- **profiles** - User accounts (extends Supabase auth)
- **children** - Child profiles (story protagonists)
- **themes** - Available story themes
- **art_styles** - Visual styles for illustrations
- **stories** - Generated storybooks
- **story_pages** - Individual pages with text and images

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.
