# Amazon SQS Documentation

// ...existing code...

## Setting Up SQS

To set up Amazon SQS, follow these steps:

1. Sign in to the AWS Management Console.
2. Open the Amazon SQS console at [https://console.aws.amazon.com/sqs/](https://console.aws.amazon.com/sqs/).
3. Choose "Create queue".
4. Configure the queue settings and choose "Create Queue".

## Common SQS Operations

### Sending a Message

To send a message to an SQS queue, use the following code:

```javascript
const { AWSSqs } = require('@danielyaghil/aws-helpers');
const client = AWSSqs.instance('us-east-1');
const success = await client.sendMessage(
  'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue',
  { message: 'Hello world' }
);
```

### Receiving a Message

To receive a message from an SQS queue, use the receiveMessage method qith queue URL as a parameter.
It retrieves the 1st available message in the queue and return an object including the message body (as an object) and receipt handle.

```javascript
const { AWSSqs } = require('@danielyaghil/aws-helpers');
const client = AWSSqs.instance('us-east-1');
const message = await client.receiveMessage(
  'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'
);
console.log(JSON.stringify(message));
```

### Deleting a Message

To delete a message from an SQS queue, use the following code:

```javascript
const { AWSSqs } = require('@danielyaghil/aws-helpers');
const client = AWSSqs.instance('us-east-1');
const success = await client.deleteMessage(
  'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue',
  'receipt-handle'
);
```

### Purging a Queue

To purge all messages from an SQS queue, use the following code:

```javascript
const { AWSSqs } = require('@danielyaghil/aws-helpers');
const client = AWSSqs.instance('us-east-1');
const success = await client.purgeQueue(
  'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'
);
```

### Get Queue Size

It provides 3 methods to get the queue size:

- getVisibleMessagesCount: returns the number of messages in the queue available for retrieval.
- getNonVisibleMessagesCount: returns the number of messages in the queue that are not available for retrieval due to being in flight.
- getDelayedMessagesCount: returns the number of messages in the queue that are delayed and not available for retrieval.

All 3 provides approximate numbers.

```javascript
const { AWSSqs } = require('@danielyaghil/aws-helpers');
const client = AWSSqs.instance('us-east-1');
const visibleCount = await client.getVisibleMessagesCount(
  'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'
);
const nonVisibleCount = await client.getNonVisibleMessagesCount(
  'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'
);
const delayedCount = await client.getDelayedMessagesCount(
  'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'
);
console.log(
  `Visible: ${visibleCount}, Non-Visible: ${nonVisibleCount}, Delayed: ${delayedCount}`
);
```

## Full working sample code

You can find full working sample code [here](../samples/sample-sqs.js).  
To validate how to run the sample, please refer to the [main samples README](../samples/README.md).
