# Environment Setup & Configuration

## Required Environment Variables

### Supabase Configuration

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Supabase Anonymous Key (Public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (Private - for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Vercel Deployment

```env
# Vercel-specific environment variables (if needed)
VERCEL_URL=your_vercel_deployment_url
```

## Supabase Project Setup

### Current Database Schema

```sql
-- Coaches table (EXISTING)
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

-- Camps table (EXISTING)
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
```

### Enums Defined

```sql
-- Camp levels
CREATE TYPE camp_level AS ENUM (
  'M13', 'M15', 'M18', 'U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Junior', 'Senior'
);

-- Coach roles
CREATE TYPE coach_role AS ENUM (
  'coach', 'directeur-general', 'directeur-hockey'
);

-- Coaching levels
CREATE TYPE coaching_level AS ENUM (
  'initiation', 'regional', 'provincial', 'national', 'haute-performance'
);
```

## Development Environment

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Supabase CLI (optional, for local development)

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd upgr8-phase1-prod

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Add your environment variables to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Start development server
npm run dev
```

### Environment File Structure

```
upgr8-phase1-prod/
├── .env.local          # Local development variables
├── .env.example        # Example environment file
└── .env.production     # Production variables (if needed)
```

## Vercel Deployment Configuration

### Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Deployment Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Supabase Configuration

### Authentication Settings

- **Site URL**: Your Vercel deployment URL
- **Redirect URLs**:
  - `https://your-domain.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for development)

### Row Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE camps ENABLE ROW LEVEL SECURITY;

-- Create policies (to be implemented)
-- This will be added when implementing proper security
```

### Database Policies (Future Implementation)

```sql
-- Example policies for coaches table
CREATE POLICY "Coaches can view their own profile" ON coaches
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Coaches can update their own profile" ON coaches
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Example policies for camps table
CREATE POLICY "Coaches can view their own camps" ON camps
  FOR SELECT USING (coach_id IN (
    SELECT id FROM coaches WHERE auth.uid()::text = id::text
  ));

CREATE POLICY "Coaches can manage their own camps" ON camps
  FOR ALL USING (coach_id IN (
    SELECT id FROM coaches WHERE auth.uid()::text = id::text
  ));
```

## Security Considerations

### Environment Variables

- ✅ `NEXT_PUBLIC_SUPABASE_URL`: Safe to expose (public)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Safe to expose (public)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`: Keep private (server-side only)

### API Security

- Use Supabase client for client-side operations
- Use service role key only for server-side operations
- Implement proper authentication checks
- Validate all user inputs

### Database Security

- Enable Row Level Security (RLS)
- Create appropriate policies for each table
- Use parameterized queries
- Validate user permissions

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

```bash
# Check if .env.local exists
ls -la .env.local

# Restart development server
npm run dev
```

#### 2. Supabase Connection Issues

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test Supabase connection
# Add this to a test file
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### 3. Vercel Deployment Issues

- Check environment variables in Vercel dashboard
- Ensure all required variables are set
- Check build logs for errors
- Verify Supabase URL and keys are correct

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if all dependencies are installed
npm list

# Run TypeScript check
npx tsc --noEmit

# Run linting
npm run lint
```

## Production Checklist

### Before Deployment

- [ ] All environment variables set in Vercel
- [ ] Supabase project configured
- [ ] Database tables created
- [ ] Authentication settings configured
- [ ] Domain configured (if applicable)

### After Deployment

- [ ] Test authentication flow
- [ ] Test database operations
- [ ] Test all CRUD operations
- [ ] Verify environment variables are loaded
- [ ] Check for any console errors

### Monitoring

- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Monitor database performance
- [ ] Track user analytics
- [ ] Monitor API usage
