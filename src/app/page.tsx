"use client";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button
        onClick={() => {
          fetch("/api")
            .then((res) => res.json())
            .then((data) => console.log(data));
        }}
      >
        Click me
      </Button>
    </div>
  );
}
