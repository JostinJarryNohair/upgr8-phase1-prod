import { Team, TeamDatabase, TeamFormData } from "@/types/team";

/**
 * Convert database format to application format
 */
export function fromDatabaseFormat(dbTeam: TeamDatabase): Team {
  return {
    id: dbTeam.id,
    coachId: dbTeam.coach_id,
    name: dbTeam.name,
    level: dbTeam.level || "",
    createdAt: dbTeam.created_at || new Date().toISOString(),
  };
}

/**
 * Convert application format to database format for inserts
 */
export function toDatabaseFormat(team: TeamFormData, coachId: string): Omit<TeamDatabase, "id" | "created_at"> {
  return {
    coach_id: coachId,
    name: team.name,
    level: team.level || null,
  };
}

/**
 * Convert application format to database format for updates
 */
export function toDatabaseUpdateFormat(updates: Partial<TeamFormData>): Partial<TeamDatabase> {
  const dbUpdates: Partial<TeamDatabase> = {};
  
  if (updates.name !== undefined) {
    dbUpdates.name = updates.name;
  }
  
  if (updates.level !== undefined) {
    dbUpdates.level = updates.level || null;
  }
  
  return dbUpdates;
} 