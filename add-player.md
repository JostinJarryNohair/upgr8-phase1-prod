# Add Player to Camp - Development Plan

## Current Status ✅

### Completed Tasks:

1. ✅ **Database Foundation**

   - Players table created in Supabase
   - Camp registrations table created in Supabase
   - TypeScript types generated and updated
   - Mappers created for database conversions

2. ✅ **Camp Detail Page Structure**

   - Two-tab layout implemented (Overview and Players)
   - shadcn Tabs component integrated
   - CampPlayers component created and integrated

3. ✅ **CampPlayers Component**

   - Search functionality for players
   - Filtering by group and evaluation status
   - Player cards with jersey numbers, positions, evaluation status
   - Cut/uncut functionality for players
   - Responsive grid layout
   - Status badges with icons
   - Average score display
   - French labels consistent with app

4. ✅ **Add Player Button**

   - "Add Player" button added to CampPlayers component
   - Positioned next to "Plus de filtres" button
   - Red styling to match UpGr8 brand
   - French label "Ajouter un joueur"

5. ✅ **Database Integration Preparation**
   - Removed all mock data from CampPlayers component
   - Implemented proper TypeScript types using PlayerWithRegistration
   - Added loading and error states
   - Implemented real database query for camp registrations
   - Added empty state with call-to-action
   - Updated status badges to use registration_status
   - Prepared for real data integration

### Current Implementation:

- **Location**: `src/components/camps/camp/CampPlayer.tsx`
- **Integration**: Imported in `src/app/coach-dashboard/camps/[id]/page.tsx`
- **Features**: Search, filter, player cards, cut functionality, real DB queries
- **Data**: Now loads real data from camp_registrations table
- **Types**: Uses PlayerWithRegistration interface
- **States**: Loading, error, and empty states implemented

## Next Steps 🎯

### Immediate Priority:

1. **Add Player Modal** - Create modal for adding new players or existing players
2. **Test Database Integration** - Verify the current DB queries work correctly
3. **Implement Cut Functionality** - Add database update for player cut status

### UI/UX for Add Player Modal:

- **Location**: Top-right of the filters section in CampPlayers
- **Options**:
  - "Add New Player" - Create new player and register to camp
  - "Add Existing Player" - Search and select existing player to register
- **Design**: Consistent with existing modal patterns in the app

### Database Operations Needed:

1. ✅ **Load Camp Players**: Query `camp_registrations` table with camp_id (IMPLEMENTED)
2. **Search Existing Players**: Query `players` table with search filters
3. **Add New Player**: Insert into `players` table + register to camp
4. **Add Existing Player**: Insert into `camp_registrations` table

### Workflow Steps:

1. Coach clicks "Add Player" button
2. Modal opens with two options
3. **Option A - New Player**: Form to create player + auto-register to camp
4. **Option B - Existing Player**: Search input + results dropdown + select + register
5. Update player list in real-time
6. Show success/error feedback

### Edge Cases to Handle:

- Player already registered to this camp
- Duplicate player names/emails
- Network errors during registration
- Validation errors (required fields, email format, etc.)

### Technical Implementation:

- **Modal Component**: Create `AddPlayerModal` component
- **Search Hook**: Implement debounced search for existing players
- **Form Validation**: Client-side validation for new player creation
- **Error Handling**: Proper error states and user feedback
- **Loading States**: Loading indicators during database operations

## Development Phases:

### Phase 1: Add Player Modal Structure ✅

- ✅ Add "Add Player" button to CampPlayers component
- Create basic AddPlayerModal component structure
- Implement modal open/close functionality

### Phase 2: Real Data Integration ✅

- ✅ Replace mock data with actual database queries
- ✅ Implement loading states for player list
- ✅ Add error handling for database operations

### Phase 3: Add New Player Flow

- Create form for new player creation
- Implement validation and submission
- Auto-register new player to camp

### Phase 4: Add Existing Player Flow

- Implement search functionality for existing players
- Create results dropdown with player selection
- Register selected player to camp

### Phase 5: Polish & Testing

- Error handling and user feedback
- Loading states and animations
- Edge case handling
- Testing all flows

## Current Blockers:

- None - ready to proceed with AddPlayerModal component

## Decisions Made:

- Using `CampPlayers` as component name (good choice!)
- French labels for consistency
- shadcn components for UI consistency
- Modal approach for add player functionality
- Real database integration implemented
- Proper TypeScript types used throughout
