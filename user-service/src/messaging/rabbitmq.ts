import amqp from "amqplib";

type RabbitMQConfig = {
  url: string;
  reconnectTimeout: number;
  maxReconnectAttempts: number;
};

export class RabbitMQClient {
  private static instance: RabbitMQClient;
  static connection: amqp.ChannelModel | null = null;
  static channel: amqp.Channel | null = null;

  public static getInstance(): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient();
    }
    return RabbitMQClient.instance;
  }

  async connect(): Promise<void> {
    try {
      RabbitMQClient.connection = await amqp.connect(
        process.env.RABBITMQ_URL || ""
      );
      RabbitMQClient.channel = await RabbitMQClient.connection.createChannel();
      console.log({
        connection: RabbitMQClient.connection,
        channel: RabbitMQClient.channel,
      });
      await RabbitMQClient.channel.assertExchange("user-events", "topic", {
        durable: true,
      });

      this.setupConnectionListeners();
    } catch (error) {
      console.error("RabbitMQ connection error:", error);
      throw error;
    }
  }

  private setupConnectionListeners(): void {
    if (!RabbitMQClient.connection) return;

    RabbitMQClient.connection.on("error", async (error) => {
      console.error("RabbitMQ connection error:", error);
      await this.handleConnectionError(error);
    });

    RabbitMQClient.connection.on("close", async () => {
      console.log("RabbitMQ connection closed");
      await this.handleConnectionError(new Error("Connection closed"));
    });
  }

  private async handleConnectionError(error: unknown): Promise<void> {
    console.error("RabbitMQ connection error:", error);
  }

  getChannel(): amqp.Channel {
    if (!RabbitMQClient.channel) {
      console.log(RabbitMQClient.channel, "----");
      throw new Error(
        "RabbitMQ channel not available. Ensure client is connected."
      );
    }
    return RabbitMQClient.channel;
  }

  async close(): Promise<void> {
    try {
      if (RabbitMQClient.channel) {
        await RabbitMQClient.channel.close();
        RabbitMQClient.channel = null;
      }
      if (RabbitMQClient.connection) {
        await RabbitMQClient.connection.close();
        RabbitMQClient.connection = null;
      }

      console.log("Closed RabbitMQ connection");
    } catch (error) {
      console.error("Error closing RabbitMQ connection:", error);
      throw error;
    }
  }
}
