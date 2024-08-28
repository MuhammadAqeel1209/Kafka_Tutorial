const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  brokers: ["192.168.18.20:9092"],
  clientId: "my-app",
});

module.exports = { kafka };
