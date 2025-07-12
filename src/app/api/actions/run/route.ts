import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client"; // Import our client

// Opt out of caching; every request should send a new event
export const dynamic = "force-dynamic";

// Create a simple async Next.js API route handler
export async function POST(request: NextRequest) {
  const actions = await request.json();
  // Send your event payload to Inngest
  await inngest.send({
    name: "test/run.actions",
    data: {
      actions: actions,
    },
  });

  return NextResponse.json({ message: "Event sent!" });
}
