import { trpc } from "@/server/trpc/server";
import { Suspense } from "react";
import { ClientGreeting } from "./client-greeting";
export default async function Home() {
  void (await trpc.hello.prefetch({ text: "world" }));
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientGreeting />
    </Suspense>
  );
}
