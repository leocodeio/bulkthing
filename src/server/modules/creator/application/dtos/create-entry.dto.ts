import { z } from 'zod';
import { YtCreatorStatus } from '../../domain/enums/yt-creator-status.enum';

export const CreateEntryDtoSchema = z.object({
  creatorId: z.string().uuid(),
  email: z.string().email(),
  accessToken: z.string(),
  refreshToken: z.string(),
  status: z.nativeEnum(YtCreatorStatus).optional().default(YtCreatorStatus.active),
});

export type CreateEntryDto = z.infer<typeof CreateEntryDtoSchema>;
