# AWS Helpers sample

## Configuration

The library uses the AWS SDK v3, so you can use any of the authorization methods supported by the SDK.
By default the samples files loads the configuration from the environment variables and are overridden by the .env file by default

So in order to use the samples, you need to define the following environment variables in [.env] (./.env) file:

- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

By default the sample are run against the latest version of the library: https://www.npmjs.com/package/@danielyaghil/aws-helpers.
If you want to run the samples against a local version of the library, you need to switch the "require" lin:

- const { <PACKAGE> } = require('@danielyaghil/aws-helpers');
- with const { <PACKAGE> } = require('../src/index');

Specific configuration for each sample at the top of the file.

## List of samples

- [Secrets Manager](./sample-secrets.js)
- [S3](./sample-s3.js)
- [DynamoDB](./sample-dynamodb.js)
- [Cognito](./sample-cognito.js)
- [SNS](./sample-sns.js)
- [SQS](./sample-sqs.js)

## Running the samples

Each sample can be run by executing the following command:

```cli
npm run sample-<package>
```

e.g. for Secret Manager:

```cli
npm run sample-secrets
```
