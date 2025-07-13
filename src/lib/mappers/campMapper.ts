// In src/lib/mappers/campMapper.ts
import { CampFormData, Camp } from "@/types/camp";
import { Database } from "@/types/database";

// ✅ Use the generated types - perfect type safety!
type DbCamp = Database["public"]["Tables"]["camps"]["Row"];
type CampLevel = Database["public"]["Enums"]["camp_level"];
type DbCampInsert = Database["public"]["Tables"]["camps"]["Insert"];
//type DbCampUpdate = Database["public"]["Tables"]["camps"]["Update"];

export function toDatabaseFormat(
  camp: CampFormData
): Omit<DbCampInsert, "coach_id"> {
  return {
    name: camp.name,
    level: camp.level,
    location: camp.location,
    description: camp.description,
    is_active: camp.isActive,
    start_date: camp.startDate,
    end_date: camp.endDate,
  };
}

// ✅ Now perfectly typed with generated schema
export function fromDatabaseFormat(dbCamp: DbCamp): Camp {
  return {
    id: dbCamp.id,
    coachId: dbCamp.coach_id,
    name: dbCamp.name,
    level: dbCamp.level as CampLevel,
    location: dbCamp.location || "",
    description: dbCamp.description || "",
    isActive: dbCamp.is_active,
    startDate: dbCamp.start_date || "",
    endDate: dbCamp.end_date || "",
    createdAt: dbCamp.created_at || "",
  };
}
