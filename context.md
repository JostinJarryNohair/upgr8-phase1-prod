🔥 UPGR8 COMPLETE DEVELOPMENT CONTEXT - CHAT-1 + CURRENT SESSION 🔥
UPGR8 Hockey Platform - Master Development Blueprint
🏗️ PROJECT OVERVIEW
UpGr8 is an intelligent hockey development and tracking platform for coaches, players, and organizations. Currently implementing Training Camp MVP with enterprise-grade architecture.
Live Production URL: https://upgr8-phase1-prod.vercel.app/

🎯 CURRENT DEVELOPMENT STATUS
✅ COMPLETED (Phase 1A)

Enterprise authentication system with cross-schema database triggers
Coach registration/login fully functional on production
Database schema with proper enums and RLS policies
Camps table created with camp_level enum
Dashboard foundation ready for camps management

🚀 CURRENT FOCUS (Phase 1B)

Camps management system - Create, view, manage training camps
Coach dashboard with separate coach-dashboard/player-dashboard structure
Simple camp creation → Camp details page → Add players workflow

🗄️ DATABASE ARCHITECTURE (LOCKED SCHEMA)
Current Production Tables
sql-- AUTHENTICATION ENUMS
CREATE TYPE coach_role AS ENUM ('coach', 'directeur-general', 'directeur-hockey');
CREATE TYPE coaching_level AS ENUM ('initiation', 'regional', 'provincial', 'national', 'haute-performance');
CREATE TYPE camp_level AS ENUM ('M13', 'M15', 'M18', 'U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Junior', 'Senior');

-- COACHES TABLE (✅ Working with enterprise triggers)
CREATE TABLE coaches (
id UUID REFERENCES auth.users(id) PRIMARY KEY,
first_name TEXT NOT NULL,
last_name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
role coach_role NOT NULL,
coaching_level coaching_level NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

-- CAMPS TABLE (✅ Ready for development)
CREATE TABLE camps (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
coach_id UUID REFERENCES coaches(id) NOT NULL,
name TEXT NOT NULL,
level camp_level,
location TEXT,
start_date DATE,
end_date DATE,
description TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
Phase 2 Extensions (LOCKED PLAN)
sql-- PLAYERS TABLE (Enterprise auth extension)
CREATE TABLE players (
id UUID REFERENCES auth.users(id) PRIMARY KEY,
first_name TEXT NOT NULL,
last_name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
date_of_birth DATE,
position TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

-- CAMP_PLAYERS (Junction Table Magic!)
CREATE TABLE camp_players (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
camp_id UUID REFERENCES camps(id) NOT NULL,
player_id UUID REFERENCES players(id) NOT NULL,
jersey_number_in_camp INTEGER,
group_name TEXT,
status TEXT DEFAULT 'active',
added_at TIMESTAMP DEFAULT NOW(),
UNIQUE(camp_id, player_id)
);

-- PLAYER INVITATION SYSTEM
CREATE TABLE camp_invitations (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
camp_id UUID REFERENCES camps(id) NOT NULL,
coach_id UUID REFERENCES coaches(id) NOT NULL,
player_email TEXT NOT NULL,
player_id UUID REFERENCES players(id), -- NULL until player registers
status TEXT DEFAULT 'pending',
invitation_token UUID DEFAULT gen_random_uuid(),
sent_at TIMESTAMP DEFAULT NOW()
);

-- PLAYER NOTIFICATIONS
CREATE TABLE player_notifications (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
player_id UUID REFERENCES players(id) NOT NULL,
camp_id UUID REFERENCES camps(id) NOT NULL,
message TEXT NOT NULL,
type TEXT DEFAULT 'camp_invitation',
read_at TIMESTAMP,
created_at TIMESTAMP DEFAULT NOW()
);

🔐 ENTERPRISE AUTHENTICATION SYSTEM
Cross-Schema Trigger Architecture
sql-- AUTOMATIC COACH PROFILE CREATION
CREATE OR REPLACE FUNCTION handle_new_coach_signup()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO public.coaches (
id, first_name, last_name, email, role, coaching_level
) VALUES (
NEW.id,
NEW.raw_user_meta_data->>'first_name',
NEW.raw_user_meta_data->>'last_name',
NEW.email,
(NEW.raw_user_meta_data->>'role')::public.coach_role,
(NEW.raw_user_meta_data->>'coaching_level')::public.coaching_level
);
RETURN NEW;
EXCEPTION WHEN OTHERS THEN
RAISE WARNING 'Error creating coach profile: %', SQLERRM;
RETURN NEW;
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER ACTIVATION
CREATE TRIGGER on_auth_user_created_coach
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_coach_signup();
Authentication Flow

Registration: auth.signUp() with metadata → Trigger creates coach profile
Login: auth.signInWithPassword() → Redirect based on user type
Session Management: Perfect ID linking (auth.users.id = coaches.id)


🏒 DEVELOPMENT STRATEGY (LOCKED)
Phase 1: CAMPS SYSTEM (Current Focus)
UX Philosophy: ONE THING AT A TIME - Never overwhelm coaches
User Flow:

Simple camp creation → Form with name, level, dates, location, description
Dashboard overview → Shows camps list with "0 players" initially
Click camp → Camp details page with "Add Players" section
Progressive enhancement → Add players → Organize groups → Assign evaluators

Phase 2: PLAYER SYSTEM (Next Attack)
Enterprise Invitation System:

Email-based player discovery (existing vs new users)
Dual-path handling: notification OR registration invitation
Player dashboard with camp invitations
Token-based security + status tracking
Multi-user auth system (coach/player types)


📁 PROJECT STRUCTURE (LOCKED)
Separate Dashboard Architecture
src/app/
├── (auth)/
│   ├── login/
│   └── register/
├── coach-dashboard/                    // ← CURRENT FOCUS
│   ├── layout.tsx                     // Coach-specific layout
│   ├── page.tsx                       // Coach dashboard with tab navigation
│   ├── camps/
│   │   ├── page.tsx                   // Camps overview
│   │   ├── create/
│   │   │   └── page.tsx              // Create camp form
│   │   └── [id]/
│   │       └── page.tsx              // Individual camp management
│   └── players/                       // Future: player management
└── player-dashboard/                   // ← PHASE 2
    ├── layout.tsx                     // Player-specific layout
    ├── page.tsx                       // Player dashboard
    ├── camps/
    │   └── page.tsx                   // My camp invitations
    └── profile/
Component Architecture Decision

Dashboard component goes in /coach-dashboard/page.tsx (NOT layout)
State management for tab navigation in page component
Layout handles auth/wrapper, Page handles dashboard logic


🎯 DATABASE DESIGN PHILOSOPHY (LOCKED)
Junction Table Magic
Three-table separation strategy:

camps table (independent)
players table (independent)
camp_players table (creates all relationships)

Benefits:
✅ Complete table independence
✅ Same player in multiple camps
✅ Camp-specific data (jersey numbers, groups)
✅ Maximum flexibility
✅ Easy roster management
Enterprise Patterns

Cross-schema triggers for automatic profile creation
Schema-qualified references (public.coaches, public.coach_role)
RLS policies for security
Foreign key constraints for data integrity
Email-based user discovery for player invitations


🚀 IMMEDIATE NEXT STEPS
Current Sprint: Camps Management

Build coach dashboard with tab navigation (/coach-dashboard/page.tsx)
Create camps overview showing coach's camps
Build camp creation form (simple: name, level, dates, location, description)
Implement camp details page (/coach-dashboard/camps/[id])
Add "Add Players" functionality (step-by-step approach)

Technical Priorities

✅ Authentication system complete and production-ready
🔄 Camps CRUD operations (current focus)
⏳ Player invitation system (Phase 2 attack)
⏳ Evaluation system (Phase 3)


💡 KEY ARCHITECTURAL DECISIONS

Separate dashboards for coaches vs players (future-proof)
Junction tables for maximum relational flexibility
Enterprise authentication with database triggers
Step-by-step UX to avoid overwhelming users
Email-centric player invitation system
Schema separation (auth vs business logic)


🔥 DEVELOPMENT PHILOSOPHY

Enterprise-grade backend with coach-friendly frontend
Step-by-step incremental building and testing
Junction table architecture for ultimate flexibility
One feature at a time to maintain quality and user experience
Production-first deployment and testing approach


🏒 This blueprint provides complete continuity for any future chat sessions. All architectural decisions, database schema, authentication patterns, development strategy, and technical implementations are permanently documented for seamless development continuation! 🚀
$$
