# SNS Helper

A simplified interface to AWS SNS.

**NOTE**: this is a work in progress and not all methods are supported yet. so if you need a specific methods, please let me know or feel free to enhance ad submit your code.

## Installation

See [Installation section in main page](README.md#installation) for details.

## Authorization

See [Authorization section in main page](README.md#authorization) for details.

## Usage

### Create a client instance

To create a client instance, you need to call the "instance" static method.
It gets the region as an optional parameter (optional) (if not provided, it will be taken from the environment variable AWS_REGION)
It returns a singleton instance of the client.

E.g.:

```javascript
const { SnsClient } = require('@danielyaghil/aws-helpers');
const client = SnsClient.instance();
```

### Publish a message

To publish a message, you need to call the "publish" method with the topic ARN and message as parameters.  
"message" shall be a json object and will be delivered to the subscribers as is.
It returns a boolean value indicating if the operation was successful or not.

E.g.:

```javascript
const { SnsClient } = require('@danielyaghil/aws-helpers');
const client = SnsClient.instance();
const success = await client.publish(
  'arn:aws:sns:us-east-1:123456789012:my-topic',
  { message: 'Hello world' }
);
```

## Full working sample code

You can find full working sample code [here](../samples/sample-sns.js).  
To validate how to run the sample, please refer to the [main samples README](../samples/README.md).
