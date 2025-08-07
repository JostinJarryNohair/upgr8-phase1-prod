// Export all validation schemas from a single entry point

// Team schemas
export {
  teamFormSchema,
  teamUpdateSchema,
  type TeamFormInput,
  type TeamUpdateInput
} from './teamSchemas';

// Player schemas
export {
  playerFormSchema,
  playerUpdateSchema,
  type PlayerFormInput,
  type PlayerUpdateInput
} from './playerSchemas';

// Tryout schemas
export {
  tryoutFormSchema,
  tryoutUpdateSchema,
  type TryoutFormInput,
  type TryoutUpdateInput
} from './tryoutSchemas';

// Regular season schemas
export {
  regularSeasonFormSchema,
  regularSeasonUpdateSchema,
  regularSeasonPlayerSchema,
  type RegularSeasonFormInput,
  type RegularSeasonUpdateInput,
  type RegularSeasonPlayerInput
} from './regularSeasonSchemas';