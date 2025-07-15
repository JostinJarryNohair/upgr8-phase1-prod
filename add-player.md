# Add Player to Camp - Development Plan

## Overview

This document outlines the step-by-step plan for implementing the "Add Player to Camp" feature. The goal is to allow coaches to add new or existing players to a camp, creating a registration in the `camp_registrations` table.

---

## 1. UI/UX

- Add an "Add Player" button in the Players tab of the camp detail page
- When clicked, open a modal with two options:
  - **Create New Player** (shows PlayerForm for new profile)
  - **Add Existing Player** (shows search/select UI for existing players)
- After adding, show success feedback and update the player list

## 2. Database

- On new player creation, insert into `players` table
- On existing player selection, use their `id`
- In both cases, insert a record into `camp_registrations` with:
  - `camp_id` (current camp)
  - `player_id` (new or existing)
  - `status` (default: 'pending' or 'registered')
  - `registration_date` (now)

## 3. Workflow Steps

1. Coach clicks "Add Player"
2. Modal opens: choose New or Existing
3. If New:
   - Fill PlayerForm, submit
   - Create player in `players` table
   - Register player in `camp_registrations`
4. If Existing:
   - Search/select player
   - Register player in `camp_registrations`
5. Show confirmation, update UI

## 4. Edge Cases & Validation

- Prevent duplicate registrations (enforced by DB unique constraint)
- Validate required fields in PlayerForm
- Handle errors (e.g., player already registered, network issues)

## 5. Next Steps

- Implement Add Player modal UI
- Integrate PlayerForm for new player
- Build player search for existing
- Connect to Supabase for DB operations
- Update Players tab to show registered players

---

**Reference:** See `CURRENT_STATUS.md` for overall project progress.
