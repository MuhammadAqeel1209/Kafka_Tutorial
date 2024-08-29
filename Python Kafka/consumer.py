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