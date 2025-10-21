import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/server/trpc/init';
import { YtCreatorRepository } from '@/server/modules/creator/infrastructure/adapters/yt-creator.repository';
import { YtCreatorService } from '@/server/modules/creator/application/services/yt-creator.service';
import { CreateEntryDtoSchema } from '@/server/modules/creator/application/dtos/create-entry.dto';
import { UpdateEntryDtoSchema } from '@/server/modules/creator/application/dtos/update-entry.dto';

const repository = new YtCreatorRepository();
const service = new YtCreatorService(repository);

export const creatorRouter = createTRPCRouter({
  create: baseProcedure
    .input(CreateEntryDtoSchema)
    .mutation(async ({ input }: any) => {
      return service.createCreatorEntry(input);
    }),

  getAll: baseProcedure
    .input(
      z.object({
        id: z.string().optional(),
        creatorId: z.string().optional(),
        email: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ input }: any) => {
      return service.getCreatorEntries(input);
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }: any) => {
      return service.getCreatorEntryById(input.id);
    }),

  getByEmail: baseProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }: any) => {
      return service.getCreatorEntryByEmail(input.email);
    }),

  update: baseProcedure
    .input(
      z.object({
        id: z.string(),
        data: UpdateEntryDtoSchema,
      }),
    )
    .mutation(async ({ input }: any) => {
      return service.updateCreatorEntry(input.id, input.data);
    }),

  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }: any) => {
      return service.deleteCreatorEntry(input.id);
    }),
});
