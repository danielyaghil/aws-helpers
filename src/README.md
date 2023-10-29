# AWS Helpers

This library provides a set of helpers to simplify the use of AWS services.
It encapsulates AWS Javascript SDK v3 (https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) while providing a simple and easy to use interface.

**NOTE**: this is a work in progress and not all services are supported yet. It grows as I need it, so if you need a specific service or specific methods inside a service, please let me know or feel free to enhance ad submit your code.

## Installation

```cli
npm install @danieyaghil/aws-helpers
```

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
const { <PackageClient> } = require('@danielyaghil/aws-helpers');
const client = <PackageClient>.instance();
```

### Region override

You can override the region defined in the environment by passing the region as a parameter to the getInstance method:

```javascript
const client = <PackageClient>.instance('REGION');
```

### Service specific usage

Please find below the usage for each of encapsulated services and supported methods.
For each there are link to sample of usage in the samples folder.

#### Secrets Manager

A simplified interface to AWS Secrets Manager.
Please find usage details [here](https://github.com/danielyaghil/aws-helpers/docs/secrets-manager.md).

#### S3

#### DynamoDB

#### Cognito
