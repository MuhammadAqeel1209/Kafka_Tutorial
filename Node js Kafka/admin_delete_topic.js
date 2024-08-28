const { kafka } = require("./client");

async function deleteAllTopics() {
  const admin = kafka.admin();
  
  try {
    console.log("Admin connecting...");
    await admin.connect();
    console.log("Admin Connection Success...");

    // Fetch all topics
    const { topics } = await admin.fetchTopicMetadata();
    const topicNames = topics.map(topic => topic.name);

    console.log("Topics to delete:", topicNames);

    // Delete all topics
    if (topicNames.length > 0) {
      console.log("Deleting topics...");
      await admin.deleteTopics({
        topics: topicNames,
        timeout: 30000, 
      });
      console.log("All topics deleted.");
    } else {
      console.log("No topics found to delete.");
    }

    // Verify deletion (optional)
    const updatedTopics = await admin.fetchTopicMetadata();
    console.log("Updated Topics Metadata:", updatedTopics.topics);

  } catch (error) {
    console.error("Error deleting topics:", error);
  } finally {
    console.log("Disconnecting Admin..");
    await admin.disconnect();
  }
}

deleteAllTopics();
