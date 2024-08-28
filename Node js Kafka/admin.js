const { kafka } = require("./client");

async function createTopics() {
  const admin = kafka.admin();
  
  try {
    console.log("Admin connecting...");
    await admin.connect();
    console.log("Admin Connection Success...");

    console.log("Creating Topic [rider-updates]");
    await admin.createTopics({
      topics: [
        {
          topic: "rider-updates",
          numPartitions: 2,
        },
      ],
    });

    console.log("Topic Created Success [rider-updates]");

  } catch (error) {
    console.error("Error creating topic:", error);
  } finally {
    console.log("Disconnecting Admin..");
    await admin.disconnect();
  }
}

createTopics();
