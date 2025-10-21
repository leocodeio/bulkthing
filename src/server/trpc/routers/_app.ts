import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { creatorRouter } from "@/server/routers/creator";
import { youtubeRouter } from "@/server/routers/youtube";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  creator: creatorRouter,
  youtube: youtubeRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
