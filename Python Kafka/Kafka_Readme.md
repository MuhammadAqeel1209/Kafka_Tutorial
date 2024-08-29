# Kafka using Python

## Prerequistie
- Knowledge
    - Node.JS Intermediate level
    - Experience with designing distributed systems Tools
- Tools
    - Node.js: [Download Python](https://www.python.org/downloads/)
    - Docker: [Download Docker](https://www.docker.com)
    - VsCode: [Download VSCode](https://code.visualstudio.com)

## Commands To Download Kafka
- confluent-kafka
``` bash
pip install confluent-kafka
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

`producer.py`

``` py
from random import choice
from confluent_kafka import Producer

if __name__ == '__main__':

    config = {
        # User-specific properties that you must set
        'bootstrap.servers': '192.168.18.20:9092'
    }

    # Create Producer instance
    producer = Producer(config)

    def delivery_callback(err, msg):
        if err:
            print('ERROR: Message failed delivery: {}'.format(err))
        else:
            print("Produced event to topic {topic}: key = {key:12} value = {value:12}".format(
                topic=msg.topic(), key=msg.key().decode('utf-8'), value=msg.value().decode('utf-8')))

    # Produce data by selecting random values from these lists.
    topic = "purchases"
    user_ids = ['eabara', 'jsmith', 'sgarcia', 'jbernard', 'htanaka', 'awalther']
    products = ['book', 'alarm clock', 't-shirts', 'gift card', 'batteries']

    count = 0
    for _ in range(10):
        user_id = choice(user_ids)
        product = choice(products)
        producer.produce(topic, product, user_id, callback=delivery_callback)
        count += 1

    # Block until the messages are sent.
    producer.poll(10000)
    producer.flush()
```
`consumer.py`
``` py
from confluent_kafka import Consumer


config = {
    # User-specific properties that you must set
    'bootstrap.servers': '192.168.18.20:9092',
    # Fixed properties
    'group.id':          'kafka-python-getting-started',
    'auto.offset.reset': 'earliest'
}
# Create Consumer instance
consumer = Consumer(config)
# Subscribe to topic
topic = "purchases"
consumer.subscribe([topic])
# Poll for new messages from Kafka and print them.
try:
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            print("Waiting...")
        elif msg.error():
            print("ERROR: %s".format(msg.error()))
        else:
            # Extract the (optional) key and value, and print.
            print("Consumed event from topic {topic}: key = {key:12} value = {value:12}".format(
                topic=msg.topic(), key=msg.key().decode('utf-8'), value=msg.value().decode('utf-8')))
except KeyboardInterrupt:
    pass
finally:
    # Leave group and commit final offsets
    consumer.close()
```
## Running Locally
- Run Consumer
``` bash
python consumer.py
```

- Run Producer
``` bash
python producer.py
```