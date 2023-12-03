# Secret Manager Helper

A simplified interface to AWS Secrets Manager.

**NOTE**: this is a work in progress and not all methods are supported yet. so if you need a specific methods, please let me know or feel free to enhance ad submit your code.

## Installation

See [Installation section in main page](README.md#installation) for details.

## Authorization

See [Authorization section in main page](README.md#authorization) for details.

## Usage

### Caching

To limit number of calls to AWS Secret Manager, the client caches the secrets in memory.  
At this point the cache is not refreshed automatically, so if you need to refresh the cache, you need to call the ["refresh"](#refresh-cache) method.

### Create a client instance

To create a client instance, you need to call the "instance" static method.
It gets the region as an optional parameter (optional) (if not provided, it will be taken from the environment variable AWS_REGION)
It returns a singleton instance of the client.

E.g.:

```javascript
const { SecretsClient } = require('@danielyaghil/aws-helpers');
const client = SecretsClient.instance();
```

### Get a secret

To get a secret, you need to call the "get" method with the secret name as a parameter

E.g.:

```javascript
const { SecretsClient } = require('@danielyaghil/aws-helpers');

const client = SecretsClient.instance();
const secret = await client.get('my-secret');
```

The secret is retrieved from the cache if exists, otherwise it is retrieved from AWS Secret Manager and then added to the cache.

### Refresh cache

To refresh the cache, you need to call the "refresh" method.

E.g.:

```javascript
const { SecretsClient } = require('@danielyaghil/aws-helpers');
const client = SecretsClient.instance();
client.refresh();
```

## Full working sample code

You can find full working sample code [here](../samples/sample-secrets.js).  
To validate how to run the sample, please refer to the [main samples README](../samples/README.md).
