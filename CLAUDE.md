# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This document provides comprehensive guidance for Claude AI assistants working with the UpGr8 platform hockey management system.

## Project Overview

**UpGr8 Platform** is a comprehensive hockey player management and evaluation system built for coaches, players, scouts, and organizations. The platform manages camps, player evaluations, teams, and regular seasons with a focus on hockey development.

### Current Status: Evaluation System Complete ✅
- The evaluation system with 14 hockey-specific criteria is fully implemented
- Player management and camp systems are operational
- Next phase: Regular season management and advanced features

## Technology Stack

### Core Technologies
- **Framework**: Next.js 15 with App Router (React Server Components)
- **Language**: TypeScript 5 (strict mode enabled)
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Styling**: Tailwind CSS v4 with custom theme
- **UI Components**: Radix UI primitives via shadcn/ui
- **Internationalization**: i18next (English/French)

### Key Dependencies
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + html2canvas
- **Authentication**: Supabase Auth
- **File Processing**: CSV parsing utilities

### Development Tools
- **TypeScript Config**: Strict mode, path mapping (`@/*`)
- **ESLint**: Next.js configuration
- **PostCSS**: Tailwind CSS processing
- **Build**: Next.js with Turbopack for dev

## Architecture Patterns

### 1. **Direct Database Access Pattern**
- Components directly call Supabase client (no API routes for most operations)
- RLS policies handle authorization at database level
- Type safety through generated database types

```typescript
// Example pattern used throughout
const { data, error } = await supabase
  .from('players')
  .select('*')
  .eq('coach_id', coachId);
```

### 2. **Type-Safe Data Mapping**
- Database types auto-generated in `/src/types/database.ts`
- Mapper functions convert between DB and frontend formats
- Located in `/src/lib/mappers/` directory

```typescript
// Example mapper pattern
export function fromDatabaseFormat(dbPlayer: DbPlayer): Player {
  return {
    id: dbPlayer.id,
    first_name: dbPlayer.first_name,
    // ... type-safe conversion
  };
}
```

### 3. **Component Organization**
- Feature-based component organization
- Reusable UI components in `/src/components/ui/`
- Business logic components by domain (players, camps, evaluations)

### 4. **Internationalization Pattern**
- `useTranslation` hook for all user-facing text
- Translation keys in `/src/locales/en.json` and `/src/locales/fr.json`
- Default language: French (`fallbackLng: 'fr'`)

## Project Structure

### Key Directories

```
/src
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication pages
│   ├── coach-dashboard/          # Main application pages
│   ├── api/waiting-list/         # API routes (minimal usage)
│   └── globals.css               # Global styles & CSS variables
├── components/                   # React components
│   ├── ui/                       # Reusable UI components (shadcn/ui)
│   ├── dashboard/                # Layout components (Sidebar, Topbar)
│   ├── players/                  # Player management components
│   ├── camps/                    # Camp management components
│   ├── evaluations/              # Evaluation system components
│   ├── regular-season/           # Regular season components
│   ├── auth/                     # Authentication components
│   └── common/                   # Shared utilities
├── lib/                          # Utility libraries
│   ├── supabase/                 # Database client
│   ├── mappers/                  # Data transformation functions
│   ├── i18n.ts                   # Internationalization setup
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript type definitions
│   ├── database.ts               # Generated Supabase types
│   ├── player.ts                 # Player-specific types
│   ├── evaluation.ts             # Evaluation types
│   └── [feature].ts              # Other feature types
├── locales/                      # Translation files
│   ├── en.json                   # English translations
│   └── fr.json                   # French translations
└── hooks/                        # Custom React hooks
    └── useTranslation.ts         # Translation hook
```

### Core Business Entities

#### 1. **Coaches** (`coaches` table)
- Authentication via Supabase Auth
- Roles: `coach`, `directeur-general`, `directeur-hockey`
- Coaching levels: `initiation` to `haute-performance`

#### 2. **Players** (`players` table)
- Comprehensive player profiles with parent information
- Positions: `forward`, `defense`, `goalie`
- Medical notes and emergency contacts

#### 3. **Evaluations** (3 tables)
- `evaluation_criteria`: 14 standardized hockey criteria
- `player_evaluations`: Main evaluation records
- `evaluation_scores`: Individual criterion scores (1-5 scale)

#### 4. **Camps** (`camps` + `camp_registrations`)
- Training camps with player registrations
- Payment tracking and status management

#### 5. **Regular Seasons** (`regular_seasons` + related tables)
- Season management with teams and players
- Tryout system integration

## Database Architecture

### Key Tables & Relationships
```
coaches (1) ---> (many) camps
coaches (1) ---> (many) player_evaluations  
coaches (1) ---> (many) teams
coaches (1) ---> (many) regular_seasons

players (many) <---> (many) camps (via camp_registrations)
players (1) ---> (many) player_evaluations
players (many) <---> (many) teams (via team_players)
```

### Row Level Security (RLS) 
- **All tables have RLS enabled** - Data is automatically filtered by coach ownership
- **Coach isolation enforced** - Coaches can only see/modify their own data
- **Generated types in `/src/types/database.ts`** - Auto-generated from Supabase schema

### Important Enums
```typescript
// Age groups for camps and evaluations
camp_level: "U7" | "U9" | "U11" | "U13" | "U15" | "U18" | "M13" | "M15" | "M18" | "Junior" | "Senior"

// Hockey positions  
player_position: "forward" | "defense" | "goalie"

// Coach organizational roles
coach_role: "coach" | "directeur-general" | "directeur-hockey"

// Payment and registration status tracking
payment_status: "pending" | "paid" | "overdue" | "refunded"
registration_status: "pending" | "confirmed" | "cancelled" | "completed"
```

## Development Guidelines

### 1. **Component Development**
- Always use TypeScript with proper typing
- Follow the established component patterns
- Use shadcn/ui components for consistency
- Implement proper loading and error states

### 2. **Data Fetching**
- Use direct Supabase client calls
- Always include coach_id filtering for security
- Handle loading states with skeleton components
- Implement proper error handling

### 3. **Internationalization**
- Never hardcode user-facing strings
- Use descriptive translation keys
- Support both English and French
- Default to French for Quebec market

### 4. **Type Safety**
- Use generated database types from `/src/types/database.ts`
- Create specific interface types for forms and components
- Use mapper functions for data transformation
- Never use `any` type

### 5. **Security Considerations** 🚨
⚠️ **CRITICAL - DO NOT DEPLOY TO PRODUCTION**: This project has serious security vulnerabilities:
- **Authentication bypass possible** - No middleware protecting routes
- **Data isolation issues** - Missing coach_id filtering in queries  
- **File upload vulnerabilities** - No size/type validation
- **Exposed credentials** - Supabase keys in repository
- **Refer to `PRODUCTION_READINESS_TODO.md` for complete critical issues list**

**SECURITY RULE**: Always add `coach_id` filtering to database queries to prevent data leakage between coaches.

### 6. **Database Access Pattern**
Always use the established pattern when working with database queries:
```typescript
// CORRECT: Always include coach_id filtering for security
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('coach_id', coachId);

// INCORRECT: Missing coach_id filter - security vulnerability
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

## Common Development Patterns

### 1. **Modal Components**
```typescript
// Standard modal pattern used throughout
export function AddPlayerModal({ isOpen, onClose, onPlayerAdded }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  // Form handling, submission, error handling
  return <Dialog open={isOpen} onOpenChange={onClose}>...</Dialog>;
}
```

### 2. **Data Fetching Pattern**
```typescript
// Standard pattern for data fetching with security
const [players, setPlayers] = useState<Player[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('coach_id', coachId); // CRITICAL: Always filter by coach_id
      
      if (error) throw error;
      setPlayers(data?.map(fromDatabaseFormat) || []);
    } catch (err) {
      setError('Failed to load players');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchPlayers();
}, [coachId]);
```

### 3. **Form Handling**
```typescript
// React Hook Form + Zod validation pattern
const form = useForm<PlayerFormData>({
  resolver: zodResolver(playerSchema),
  defaultValues: { /* ... */ }
});

const onSubmit = async (data: PlayerFormData) => {
  // Validation, API call, success/error handling
};
```

## Development Commands

### Core Scripts
```bash
npm run dev          # Development server with Turbopack (Fast refresh, hot reload)
npm run build        # Production build (Type checking included)
npm start            # Production server
npm run lint         # ESLint checking and code quality
```

### Development Workflow
- **Local Development**: Use `npm run dev` with Turbopack for optimal performance
- **Before Committing**: Run `npm run lint` to ensure code quality
- **Testing Build**: Use `npm run build` to verify production compatibility
- **No Test Suite**: Currently no test framework is configured (see Testing Notes below)

### Environment Setup
Required environment variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing Notes

⚠️ **No testing framework currently configured**
- No test files exist in the source code
- Consider adding Jest + React Testing Library
- Focus on critical business logic testing
- Add integration tests for authentication flows

## Known Issues & TODOs

### Critical Issues (from PRODUCTION_READINESS_TODO.md)
1. **Security vulnerabilities** - Authentication bypass possible
2. **Exposed credentials** - Supabase keys need rotation
3. **Missing authorization checks** - Database queries lack coach_id filtering
4. **File upload vulnerabilities** - No size limits or validation

### Development TODOs
1. Implement authentication middleware
2. Add comprehensive testing suite  
3. Optimize database queries and add indexing
4. Improve error boundaries and error handling
5. Add monitoring and logging systems

## Working with This Codebase

### For New Features
1. Follow the established component patterns
2. Create proper TypeScript types
3. Add internationalization keys
4. Implement RLS-compliant database queries
5. Add loading states and error handling

### For Bug Fixes
1. Check `PRODUCTION_READINESS_TODO.md` for known issues
2. Verify authentication and authorization
3. Test with different user roles
4. Ensure proper data isolation between coaches

### For Security Issues
1. **NEVER deploy without fixing critical security issues**
2. Always filter database queries by coach_id
3. Validate and sanitize all user inputs
4. Implement proper authentication middleware

## Resources

- **Development Rules**: See `DEVELOPMENT_RULES.md` for detailed architectural info
- **Security Issues**: See `PRODUCTION_READINESS_TODO.md` for security concerns
- **Database Schema**: Generated types in `/src/types/database.ts`
- **UI Components**: shadcn/ui documentation for component usage
- **Supabase Docs**: For database and authentication patterns

## Key File Locations

### Critical Files to Understand
- `/src/types/database.ts` - Auto-generated Supabase types (DO NOT EDIT MANUALLY)
- `/src/lib/mappers/` - Data transformation functions between DB and frontend
- `/src/lib/supabase/client.ts` - Supabase client configuration
- `/src/components/ui/` - Reusable UI components (shadcn/ui)
- `/src/locales/` - Translation files (en.json, fr.json)

### Configuration Files
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration with path mapping
- `components.json` - shadcn/ui configuration

## Current Working State

### Modified Files (per git status)
- `src/app/layout.tsx` - Has local modifications, check before committing

### Git Branch Info
- **Current Branch**: `main`
- **Main Branch**: `main` (use for PRs)
- **Recent Commits**: Focus on data model improvements and navigation restructuring

## Last Updated
- **Created**: January 2025  
- **Status**: Evaluation system complete, regular season in development
- **Security Status**: ⚠️ **NOT PRODUCTION READY** - Critical security vulnerabilities exist
- **Next Phase**: Regular season management features