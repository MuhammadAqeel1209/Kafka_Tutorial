# Kafka using Node Js JavaScript

## Prerequistie
- Knowledge
    - Node.JS Intermediate level
    - Experience with designing distributed systems Tools
- Tools
    - Node.js: [Download Node.JS](https://nodejs.org/en)
    - Docker: [Download Docker](https://www.docker.com)
    - VsCode: [Download VSCode](https://code.visualstudio.com)

## Commands To Download Kafka

``` bash
npm init
npm install kafka
```

## Commands
- Start Zookeper Container and expose PORT `2181`

``` bash
docker run -p 2181:2181 zookeper
```
- Start Kafka Container and expose PORT `9092`
``` bash
docker run -p 9092:9092 \
-e KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 \
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 \
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
confluentinc/cp-kafka
```

## Code
`client.js`
``` js 
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  brokers: ["<PRIVATE_IP>:9092"],
  clientId: "my-app",
});

module.exports = { kafka };
```

`admin.js`
``` js
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
```

`producer.js`

``` js
const { kafka } = require("./client");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function init() {
  const producer = kafka.producer();

  console.log("Connecting Producer");
  await producer.connect();
  console.log("Producer Connected Successfully");

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", async function (line) {
    const [riderName, location] = line.split(" ");
    await producer.send({
      topic: "rider-updates",
      messages: [
        {
          partition: location.toLowerCase() === "north" ? 0 : 1,
          key: "location-update",
          value: JSON.stringify({ name: riderName, location }),
        },
      ],
    });
  }).on("close", async () => {
    await producer.disconnect();
  });
}

init();
```
`consumer.js`
``` js
const { kafka } = require("./client");
const group = process.argv[2];

async function init() {
  const consumer = kafka.consumer({ groupId: group });
  await consumer.connect();

  await consumer.subscribe({ topics: ["rider-updates"], fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(
        `${group}: [${topic}]: PART:${partition}:`,
        message.value.toString()
      );
    },
  });
}

init();
```
## Running Locally
- Run Multiple Consumer
``` bash
node consumer.js <GROUP_NAME>
```

- Run Producer
``` bash
node producer.js
```

```bash
> Name Location
```

