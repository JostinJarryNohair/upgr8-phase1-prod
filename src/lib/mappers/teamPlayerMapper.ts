import { TeamPlayerInsert, TeamPlayerUpdate, TeamPlayerWithPlayerInfo } from '../../types/teamPlayer';

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
export const fromTeamPlayerDatabaseFormat = (data: any): TeamPlayerWithPlayerInfo => {
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