"use client";
import { trpc } from "@/server/trpc/client";
export function ClientGreeting() {
  const [data] = trpc.hello.useSuspenseQuery({ text: "world" });
  return <div>{data.greeting}</div>;
}
