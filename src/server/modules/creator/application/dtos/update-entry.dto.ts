import { z } from 'zod';
import { YtCreatorStatus } from '../../domain/enums/yt-creator-status.enum';

export const UpdateEntryDtoSchema = z.object({
  creatorId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  status: z.nativeEnum(YtCreatorStatus).optional(),
});

export type UpdateEntryDto = z.infer<typeof UpdateEntryDtoSchema>;
