"use client";
import { trpc } from "@/server/trpc/client";
import { Suspense } from "react";

export default function Home() {
  const [data] = trpc.hello.useSuspenseQuery({ text: "harry" });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>{data.greeting}</div>
    </Suspense>
  );
}
