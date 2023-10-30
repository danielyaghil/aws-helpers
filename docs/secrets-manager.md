# Secret Manager Client

A simplified interface to AWS Secrets Manager.

**NOTE**: this is a work in progress and not all methods are supported yet. so if you need a specific methods, please let me know or feel free to enhance ad submit your code.

## Installation

See [Installation section in main page](README.md#installation) for details.

## Authorization

See [Authorization section in main page](README.md#authorization) for details.

## Usage

### Caching

To avoid multiple calls to AWS, the client caches the secrets in memory.

### Get a secret

```javascript
const { SecretsClient } = require('@danielyaghil/aws-helpers');
```