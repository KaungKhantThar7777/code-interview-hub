import { getChannel } from "./rabbitmq";

import { User } from "../db/schema";

export async function publishUserEvent(user: User, event: string) {
  try {
    const channel = getChannel();

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      event,
    };

    channel.publish(
      "user-events",
      event,
      Buffer.from(JSON.stringify(payload)),
      {
        persistent: true,
      }
    );

    console.log(`Published user.registered event for user ${user.id}`);
  } catch (error) {
    console.error("Failed to publish user event", error);
  }
}
