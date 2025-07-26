# Player Management Implementation Plan

## Database Schema

```sql
-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    position TEXT,
    jersey_number INTEGER,
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Link table (many-to-many)
CREATE TABLE camp_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID REFERENCES camps(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered',
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(camp_id, player_id)
);
```

## Implementation Steps

1. Add database tables
2. Create "Players" tab in camp detail page
3. Build player registration modal
4. Add player list component
5. Implement player management actions

## Key Relationship

- `camps (1) ←→ (many) camp_registrations (many) ←→ (1) players`
- Use `camp_registrations` as the bridge table
