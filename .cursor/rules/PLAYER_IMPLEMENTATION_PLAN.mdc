# 🏒 Player Management Implementation Plan

## **Database Schema**

### **Players Table**

```sql
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE, -- For future email invitations
    phone TEXT,
    birth_date DATE,
    position TEXT CHECK (position IN ('Forward', 'Defense', 'Goalie')),
    jersey_number INTEGER,
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    emergency_contact TEXT,
    medical_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### **Camp Registrations Table (Bridge)**

```sql
CREATE TABLE camp_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID REFERENCES camps(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    registration_date TIMESTAMP DEFAULT now(),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'attended')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(camp_id, player_id) -- Prevent duplicate registrations
);
```

### **Future: Email Invitations Table**

```sql
CREATE TABLE player_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID REFERENCES camps(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    invitation_token TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    accepted_at TIMESTAMP
);
```

## **TypeScript Types**

```typescript
// Add to src/types/player.ts
export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  position?: "Forward" | "Defense" | "Goalie";
  jersey_number?: number;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  emergency_contact?: string;
  medical_notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampRegistration {
  id: string;
  camp_id: string;
  player_id: string;
  registration_date: string;
  status: "registered" | "confirmed" | "cancelled" | "attended";
  payment_status: "pending" | "paid" | "refunded";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerInvitation {
  id: string;
  camp_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  invitation_token: string;
  status: "pending" | "accepted" | "expired";
  expires_at: string;
  created_at: string;
  accepted_at?: string;
}
```

## **Workflow Implementation**

### **Phase 1: Basic Player Management (Immediate)**

#### **1.1 Add Players to Camp**

- **Coach clicks "Add Player"** in camp detail page
- **Modal opens** with two options:
  - "Add New Player" (creates profile)
  - "Invite Existing Player" (search by email/name)

#### **1.2 Player Registration Modal**

```typescript
interface AddPlayerModalProps {
  campId: string;
  onPlayerAdded: (player: Player) => void;
  existingPlayers?: Player[];
}
```

**Modal Flow:**

1. **Coach selects "New Player" or "Existing Player"**
2. **If New Player**: Fill out complete player profile
3. **If Existing Player**: Search and select from list
4. **Set registration status** (registered, confirmed)
5. **Add notes** (optional)
6. **Create camp_registration record**

#### **1.3 Player List Component**

```typescript
interface PlayerListProps {
  campId: string;
  players: (Player & { registration: CampRegistration })[];
  onPlayerStatusChange: (playerId: string, status: string) => void;
  onPlayerRemove: (playerId: string) => void;
}
```

**Features:**

- Display player name, position, jersey number
- Show registration status and payment status
- Quick actions: edit, remove, change status
- Sort and filter options

### **Phase 2: Enhanced Features (Future)**

#### **2.1 Email Invitation System**

- **Coach invites player by email**
- **System sends invitation email** with registration link
- **Player clicks link** and completes profile
- **Automatic camp registration** upon profile completion

#### **2.2 Player Profile Management**

- **Player dashboard** for self-service
- **Profile updates** and preferences
- **Registration history** across all camps
- **Medical information** management

#### **2.3 Bulk Operations**

- **CSV import** for multiple players
- **Bulk status updates** (confirm all, mark paid, etc.)
- **Bulk messaging** to players/parents

## **UI Components to Create**

### **1. Player Management Tab**

```typescript
// src/components/camps/PlayerManagement.tsx
export function PlayerManagement({ campId }: { campId: string }) {
  // Player list, add player button, statistics
}
```

### **2. Add Player Modal**

```typescript
// src/components/players/AddPlayerModal.tsx
export function AddPlayerModal({
  isOpen,
  onClose,
  campId,
  onPlayerAdded,
}: AddPlayerModalProps) {
  // New player form or existing player search
}
```

### **3. Player List Component**

```typescript
// src/components/players/PlayerList.tsx
export function PlayerList({
  players,
  onStatusChange,
  onRemove,
}: PlayerListProps) {
  // Player cards with actions
}
```

### **4. Player Search Component**

```typescript
// src/components/players/PlayerSearch.tsx
export function PlayerSearch({
  onPlayerSelect,
}: {
  onPlayerSelect: (player: Player) => void;
}) {
  // Search existing players by name/email
}
```

## **Database Queries**

### **Get Camp Players**

```sql
SELECT
    p.*,
    cr.status as registration_status,
    cr.payment_status,
    cr.registration_date,
    cr.notes as registration_notes
FROM players p
JOIN camp_registrations cr ON p.id = cr.player_id
WHERE cr.camp_id = $1
ORDER BY p.last_name, p.first_name;
```

### **Search Existing Players**

```sql
SELECT * FROM players
WHERE (LOWER(first_name) LIKE LOWER($1) OR LOWER(last_name) LIKE LOWER($1))
   OR LOWER(email) LIKE LOWER($1)
   AND is_active = true
LIMIT 10;
```

### **Camp Statistics**

```sql
SELECT
    COUNT(*) as total_players,
    COUNT(CASE WHEN cr.status = 'confirmed' THEN 1 END) as confirmed_players,
    COUNT(CASE WHEN cr.payment_status = 'paid' THEN 1 END) as paid_players,
    COUNT(CASE WHEN cr.status = 'attended' THEN 1 END) as attended_players
FROM camp_registrations cr
WHERE cr.camp_id = $1;
```

## **Implementation Steps**

### **Step 1: Database Setup**

1. Create `players` table
2. Create `camp_registrations` table
3. Add indexes for performance
4. Update TypeScript types

### **Step 2: Basic UI Components**

1. Create `PlayerManagement` component
2. Create `AddPlayerModal` component
3. Create `PlayerList` component
4. Add "Players" tab to camp detail page

### **Step 3: Core Functionality**

1. Implement player creation
2. Implement player search
3. Implement camp registration
4. Add player status management

### **Step 4: Enhanced Features**

1. Email invitation system
2. Player profile management
3. Bulk operations
4. Advanced filtering

## **Security Considerations**

- **Coach ownership**: Only camp owner can manage players
- **Data privacy**: Secure medical and contact information
- **Email verification**: Validate email addresses for invitations
- **Access control**: Players can only see their own data
- **Audit trail**: Track all registration changes

## **Future Email System**

### **Invitation Flow:**

1. **Coach enters player email** in invitation modal
2. **System creates invitation record** with unique token
3. **Email sent** with registration link
4. **Player clicks link** and completes profile
5. **System creates player record** and camp registration
6. **Coach notified** of successful registration

### **Email Templates:**

- **Invitation Email**: Welcome message with registration link
- **Welcome Email**: Confirmation after profile creation
- **Camp Reminder**: Reminder before camp starts
- **Status Updates**: Payment confirmations, etc.

## **File Structure**

```
src/
├── app/coach-dashboard/camps/[id]/
│   └── components/
│       └── PlayerManagement.tsx
├── components/players/
│   ├── AddPlayerModal.tsx
│   ├── PlayerList.tsx
│   ├── PlayerSearch.tsx
│   └── PlayerCard.tsx
├── lib/mappers/
│   └── playerMapper.ts
└── types/
    └── player.ts
```

This comprehensive plan covers immediate implementation and future enhancements with email invitations and advanced features! 🚀
