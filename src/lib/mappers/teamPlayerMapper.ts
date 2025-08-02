import { TeamPlayerInsert, TeamPlayerWithPlayerInfo } from '../../types/teamPlayer';

// Define the database response type
interface TeamPlayerDatabaseResponse {
  id: string;
  player_id: string;
  team_id: string;
  created_at: string;
  updated_at: string;
  player?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    position: "forward" | "defense" | "goalie" | null;
    jersey_number: number | null;
    is_active: boolean | null;
  } | null;
}

/**
 * Converts frontend team player data to database format
 */
export const toTeamPlayerDatabaseFormat = (data: { player_id: string; team_id: string }): TeamPlayerInsert => {
  return {
    player_id: data.player_id,
    team_id: data.team_id,
  };
};

/**
 * Converts database team player data to frontend format
 */
export const fromTeamPlayerDatabaseFormat = (data: TeamPlayerDatabaseResponse): TeamPlayerWithPlayerInfo => {
  return {
    id: data.id,
    player_id: data.player_id,
    team_id: data.team_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    player: {
      id: data.player?.id || data.player_id,
      first_name: data.player?.first_name || '',
      last_name: data.player?.last_name || '',
      email: data.player?.email || null,
      phone: data.player?.phone || null,
      position: data.player?.position || null,
      jersey_number: data.player?.jersey_number || null,
      is_active: data.player?.is_active || null,
    },
  };
}; 