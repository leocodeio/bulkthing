import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/server/trpc/init';
import { YtCreatorRepository } from '@/server/modules/creator/infrastructure/adapters/yt-creator.repository';
import { YtCreatorService } from '@/server/modules/creator/application/services/yt-creator.service';
import { YtAuthService } from '@/server/modules/youtube/application/services/yt-auth.service';

const creatorRepository = new YtCreatorRepository();
const creatorService = new YtCreatorService(creatorRepository);
const authService = new YtAuthService(creatorService);

export const youtubeRouter = createTRPCRouter({
  getAuthUrl: baseProcedure.query(async () => {
    return authService.getAuthUrl();
  }),

  handleCallback: baseProcedure
    .input(
      z.object({
        code: z.string(),
        email: z.string().optional(),
      }),
    )
    .mutation(async ({ input }: any) => {
      return authService.handleOAuthCallback(input.code, input.email);
    }),

  getChannelInfo: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }: any) => {
      return authService.getChannelInfo(input.id);
    }),

  uploadVideo: baseProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()).optional(),
        privacyStatus: z.enum(['private', 'unlisted', 'public']).optional(),
      }),
    )
    .mutation(async ({ input }: any) => {
      throw new Error(
        'Video upload requires file handling. Use the REST API endpoint instead.',
      );
    }),
});
