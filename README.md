# AWS Helpers

This library provides a set of helpers to simplify the use of AWS services.
It encapsulates AWS SDK v3 (https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

## Installation

npm install @danielyaghil/aws-helpers

## Usage

### Authorization

The library uses the AWS SDK v3, so you can use any of the authorization methods supported by the SDK.

For example, you can simply define in your environment the following variables:

-   AWS_ACCESS_KEY_ID
-   AWS_SECRET_ACCESS_KEY
-   AWS_REGION

### Singleton pattern

The library uses the singleton pattern, so you can use the same instance of the service in your code.
So to invoke specific service, you can use the following code:

```javascript
const { XXXClient } = require('@danielyaghil/aws-helpers');
const client = XXXClient.instance();
```

### Region override

You can override the region defined in the environment by passing the region as a parameter to the getInstance method:

```javascript
const client = XXXClient.instance('REGION');
```

### Service specific usage

Please find below the usage for each of encapsulated services and supported methods.
For each there are link to sample of usage in the samples folder.

#### Secrets Manager

#### S3

#### DynamoDB

#### Cognito
