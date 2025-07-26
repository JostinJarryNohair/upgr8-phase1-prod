# Development Rules for upgr8-platform

## Project Overview
This is a Next.js 15 application with TypeScript, Supabase, and Tailwind CSS for hockey player management and evaluation.

## Current Stage: Evaluation System ✅ COMPLETE

### Database Schema
- **evaluation_criteria**: Stores 14 evaluation criteria (technical, tactical, mental)
- **player_evaluations**: Main evaluation records linking players to coaches
- **evaluation_scores**: Individual scores for each criterion (14 per evaluation)
- **RLS Policies**: Coaches can only see their own evaluations

### Key Features Implemented
- ✅ Complete evaluation creation with 14 criteria
- ✅ Evaluation management UI with search and filters
- ✅ Single player pages with evaluation history
- ✅ Real-time data refresh and navigation
- ✅ Type-safe throughout with proper TypeScript types

## File Structure

```
upgr8-platform/
  - add-player.md
  - components.json
  - eslint.config.mjs
  - next.config.ts
  - package-lock.json
  - package.json
  - postcss.config.mjs
  - public/
    - logo.png
    - signup.jpg
  - README.md
  - src/
    - app/
      - (auth)/
        - layout.tsx
        - login/
          - page.tsx
        - register/
          - page.tsx
      - api/
        - waiting-list/
          - route.ts
      - coach-dashboard/
        - camps/
          - [id]/
            - page.tsx
          - page.tsx
        - evaluations/
          - page.tsx ✅ UPDATED - Full evaluation management
        - layout.tsx
        - page.tsx
        - players/
          - [id]/
            - page.tsx ✅ NEW - Single player page with evaluations
          - page.tsx
        - regular-season/
          - page.tsx
          - season/
            - [id]/
              - page.tsx
          - tryout/
            - [id]/
              - page.tsx
        - settings/
          - page.tsx
        - staff/
          - page.tsx
        - teams/
          - page.tsx
        - training/
          - page.tsx
      - favicon.ico
      - globals.css
      - layout.tsx
      - page.tsx
      - players-dashboard/
        - page.tsx
      - scout-dashboard/
        - page.tsx
    - components/
      - auth/
        - LoginForm.tsx
        - RegisterForm.tsx
      - camps/
        - AddCampModal.tsx
        - camp/
          - CampPlayer.tsx
        - CampManagement.tsx
      - common/
        - DynamicButton.tsx
        - DynamicInput.tsx
        - LanguageSwitcher.tsx
      - dashboard/
        - DashboardLayout.tsx
        - Sidebar.tsx
        - Topbar.tsx
      - evaluations/ ✅ NEW DIRECTORY
        - CreateEvaluationModal.tsx ✅ NEW - Evaluation form with 14 criteria
        - EvaluationsManagement.tsx ✅ NEW - Evaluation list and management
      - OriginalLandingPage.tsx
      - players/
        - AddPlayerModal.tsx
        - BulkImportModal.tsx
        - PlayersManagement.tsx ✅ UPDATED - Added navigation to player pages
      - providers/
        - I18nProvider.tsx
      - regular-season/
        - AddTryoutModal.tsx
        - tryout/
          - EndTryoutModal.tsx
          - TryoutPlayers.tsx
        - TryoutManagement.tsx
      - ui/
        - avatar.tsx
        - badge.tsx
        - button.tsx
        - card.tsx ✅ NEW - Card component for player pages
        - dialog.tsx ✅ NEW - Modal component for evaluations
        - dropdown-menu.tsx
        - input.tsx
        - label.tsx
        - select.tsx
        - table.tsx
        - tabs.tsx
        - textarea.tsx ✅ NEW - Textarea component for notes
      - WaitingList.tsx
    - hooks/
      - useTranslation.ts
    - lib/
      - csvParser.ts
      - fieldMapping.ts
      - i18n.ts
      - mappers/
        - campMapper.ts
        - campRegistrationMapper.ts
        - evaluationMapper.ts ✅ NEW - Evaluation data mapping
        - playerMapper.ts
        - regularSeasonMapper.ts
        - regularSeasonPlayerMapper.ts
        - tryoutMapper.ts
        - tryoutRegistrationMapper.ts
      - supabase/
        - client.ts
      - utils.ts
    - locales/
      - en.json
      - fr.json
    - types/
      - camp.ts
      - campRegistration.ts
      - coach.ts
      - database.ts ✅ UPDATED - Added evaluation tables
      - evaluation.ts ✅ NEW - Evaluation TypeScript types
      - player.ts
      - regularSeason.ts
      - regularSeasonPlayer.ts
      - tryout.ts
      - tryoutRegistration.ts
  - tsconfig.json
```

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) with direct client usage
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI / shadcn/ui
- **Internationalization**: i18next (French/English)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Security**: Row Level Security (RLS) in Supabase

## Development Patterns
- **Database Access**: Direct Supabase client calls (no API routes)
- **Type Safety**: Strict TypeScript throughout
- **Component Structure**: Modular, reusable components
- **State Management**: Local React state (useState, useEffect)
- **Data Mapping**: Mapper functions for database ↔ frontend conversion
- **Navigation**: Next.js App Router with dynamic routes

## Current Status
- ✅ **Camp System**: Complete
- ✅ **Player Management**: Complete  
- ✅ **Evaluation System**: Complete
- 🔄 **Next Phase**: TBD (Regular Season, Tryouts, etc.)

## Key Features
1. **Player Management**: Add, edit, import players with camp registrations
2. **Camp Management**: Create and manage hockey camps
3. **Evaluation System**: 14-criteria player evaluations with history tracking
4. **Multi-language**: French and English support
5. **Responsive Design**: Works on all device sizes
6. **Real-time Updates**: Data refreshes automatically
7. **Type Safety**: Full TypeScript coverage

## Database Tables
- `coaches`: Coach information and authentication
- `players`: Player profiles and details
- `camps`: Camp definitions and settings
- `camp_registrations`: Player enrollments in camps
- `evaluation_criteria`: 14 evaluation criteria (technical, tactical, mental)
- `player_evaluations`: Main evaluation records
- `evaluation_scores`: Individual criterion scores
- `regular_seasons`: Season definitions
- `tryouts`: Tryout sessions
- `tryout_registrations`: Player tryout enrollments

## Security
- Row Level Security (RLS) enabled on all tables
- Coaches can only access their own data
- Authentication via Supabase Auth
- Type-safe database operations

## Next Steps
The evaluation system is complete and ready for production use. The next phase could include:
- Regular season management
- Tryout system enhancements
- Advanced reporting and analytics
- Team management features
- Performance tracking over time 