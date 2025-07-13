# UpGr8 Hockey Camp Management Platform

## Project Overview

Next.js application for managing hockey camps with coach and player dashboards, built with Supabase backend and authentication.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **UI**: Custom components with shadcn/ui patterns
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (configured and ready)
- **Brand**: Red color scheme implemented

## Current Architecture

### Authentication Flow

- Supabase Auth integration
- Role-based access (coach vs player)
- Protected routes with middleware
- Session management

### Database Schema

```sql
-- Coaches table (ACTUAL SCHEMA)
CREATE TABLE coaches (
  id UUID PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  coaching_level ENUM('initiation', 'regional', 'provincial', 'national', 'haute-performance') NOT NULL,
  role ENUM('coach', 'directeur-general', 'directeur-hockey') DEFAULT 'coach',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Camps table (ACTUAL SCHEMA)
CREATE TABLE camps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  level ENUM('M13', 'M15', 'M18', 'U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Junior', 'Senior'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table (PLANNED - to be created)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  position ENUM('forward', 'defense', 'goalie') DEFAULT 'forward',
  level ENUM('M13', 'M15', 'M18', 'U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Junior', 'Senior'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Camp registrations (PLANNED - many-to-many)
CREATE TABLE camp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id UUID REFERENCES camps(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  UNIQUE(camp_id, player_id)
);
```

## Key Features Implemented

### Coach Dashboard

- ✅ Camp creation and management
- ✅ Camp listing with CRUD operations
- ✅ Individual camp pages (`/coach-dashboard/camps/[id]`)
- ✅ Delete functionality with confirmation
- ✅ Responsive layout with sidebar navigation

### Authentication

- ✅ Login/Register forms
- ✅ Supabase integration
- ✅ Protected routes
- ✅ Role-based access control

### UI Components

- ✅ Reusable form components (DynamicInput, DynamicButton)
- ✅ Modal components for confirmations
- ✅ Dashboard layout with sidebar
- ✅ Responsive design patterns

## Planned Features

### Player Management (Next Priority)

- Player profile creation
- Invite existing players to camps
- Email invitation system
- Player registration workflow
- Payment integration

### Advanced Features

- Real-time notifications
- File uploads (camp photos, player documents)
- Reporting and analytics
- Mobile app considerations

## Development Decisions

### URL Structure

- `/coach-dashboard/camps` - Camp listing
- `/coach-dashboard/camps/[id]` - Individual camp management
- `/players-dashboard` - Player dashboard (planned)

### Security Approach

- Row Level Security (RLS) in Supabase
- Ownership verification for all operations
- Proper foreign key relationships
- Input validation and sanitization

### State Management

- Server-side data fetching with Next.js
- Optimistic updates for better UX
- Proper error handling and loading states

## Environment Setup

- Supabase project configured
- Environment variables for API keys
- TypeScript strict mode enabled
- ESLint and Prettier configured

## Testing Strategy

- Manual testing for CRUD operations
- SQL scripts for database verification
- Network request monitoring
- User flow testing

## Deployment Considerations

- Vercel deployment ready
- Environment variable management
- Database migration strategy
- Performance optimization needed
