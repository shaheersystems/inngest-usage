import { inngest } from "@/inngest/client";
import { pusher } from "@/pusher/pusher";

const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "2s");
    return { message: `Hello!, ${event.data.email}` };
  }
);

type Action = {
  id: string;
  name: string;
  description: string;
  done: boolean;
  type: string;
};

const runActions = inngest.createFunction(
  { id: "run-actions" },
  { event: "test/run.actions" },
  async ({ event, step }) => {
    const results = [];

    for (const action of event.data.actions as Action[]) {
      if (!action.done) {
        // Wait for 5 seconds
        await step.sleep(`wait-${action.id}`, "5s");

        // Run the action and mark it as done
        const result = await step.run(`run-${action.id}`, async () => {
          action.done = true;

          // Send Pusher notification for action completion
          await pusher.trigger("actions", "action-completed", {
            actionId: action.id,
            actionName: action.name,
            done: true,
            message: `Action ${action.name} completed`,
            timestamp: new Date().toISOString(),
          });

          return {
            message: `Action ${action.id} completed`,
            actionId: action.id,
            done: true,
          };
        });

        results.push(result);
      }
    }

    // Send notification that all actions are completed
    await pusher.trigger("actions", "all-actions-completed", {
      message: "All actions completed",
      totalActions: results.length,
      timestamp: new Date().toISOString(),
    });

    return {
      message: "All actions completed",
      results,
    };
  }
);
export const functions = [helloWorld, runActions];
