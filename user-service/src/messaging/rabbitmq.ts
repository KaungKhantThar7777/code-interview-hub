import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "";

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

export async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    console.log({ channel });
    await channel.assertExchange("user-events", "topic", { durable: true });

    return { connection, channel };
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
  }
}

export function getChannel(): amqp.Channel {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
}

export async function closeConnection() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("Closed RabbitMQ connection");
  } catch (error) {
    console.error("Error closing RabbitMQ connection:", error);
  }
}
