import amqp from "amqplib";
import { EmailData, sendEmail } from "./email";

export async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"
    );

    console.log("Connected to RabbitMQ");

    const channel = await connection.createChannel();

    const exchange = "user_events";

    await channel.assertExchange(exchange, "topic", { durable: true });

    const { queue } = await channel.assertQueue("email-service-queue", {
      durable: true,
    });

    await channel.bindQueue(queue, exchange, "user.registered");
    console.log(`Waiting for messages in ${queue}...`);

    channel.consume(queue, async (message) => {
      if (message) {
        try {
          console.log("📥 Received:", message.content.toString());

          const user = JSON.parse(message.content.toString());

          const emailData: EmailData = {
            to: user.email,
            subject: "Welcome to our app",
            text: `Welcome ${user.name} to our app`,
            html: `<p>Welcome ${user.name} to our app</p>`,
          };

          await sendEmail(emailData);

          console.log("✅ Email sent!");
          channel.ack(message); // ✅ Acknowledge the message here
        } catch (error) {
          console.error("❌ Error:", error);
          channel.nack(message, false, true); // ❌ Requeue message on failure
        }
      }
    });

    connection.on("close", (err) => {
      console.error("RabbitMQ connection closed", err);
      setTimeout(connectToRabbitMQ, 1000);
    });
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    setTimeout(connectToRabbitMQ, 1000);
  }
}
