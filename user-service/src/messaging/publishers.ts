import { RabbitMQClient } from "./rabbitmq";
import { User } from "../db/schema";

type UserEventPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  event: string;
};

export class UserEventPublisher {
  constructor(private readonly rabbitMQClient: RabbitMQClient) {}

  public async publishUserEvent(user: any, eventType: string): Promise<void> {
    try {
      const channel = this.rabbitMQClient.getChannel();

      await channel.assertExchange("user_events", "topic", { durable: true });

      const message = Buffer.from(JSON.stringify(user));
      channel.publish("user_events", eventType, message, {
        persistent: true,
        contentType: "application/json",
      });
      console.log(`Published ${eventType} event for user ${user.id}`);
    } catch (error) {
      console.error("Failed to publish event:", error);
      throw error;
    }
  }
}
