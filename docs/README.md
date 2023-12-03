# AWS Helpers Documentation

This library provides a set of helpers to simplify the use of AWS services.

It encapsulates AWS Javascript SDK v3 (https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) while providing a simple and easy to use interface.

**NOTE**: this is a work in progress and not all services are supported yet. It grows as need appear in projects i am working on; so if you have a need to a specific AWS service helper or specific methods inside a service, do not be upset :smirk:, just let me know (and i'll do my best to add) or feel free to enhance and submit your code :stuck_out_tongue_winking_eye:.

## Installation

```cli
npm install @danieyaghil/aws-helpers
```

## Usage

### Authorization

The library uses the AWS SDK v3, so you can use any of the authorization methods supported by the SDK.

For example, you can simply define in your environment the following variables:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION

**Note**:

- AWS_REGION can be overridden in code in constructor of each service helper (see [below](#region-override))
- It is recommended for service to use IAM role instead of IAM usr security credentials where possible

### Singleton pattern

The library uses the singleton pattern, so you can use the same instance of the service in your code.

So to invoke specific helper, you can use the following code:

```javascript
const { <PackageClient> } = require('@danielyaghil/aws-helpers');
const client = <PackageClient>.instance();
```

### Region override

You can override the region defined in the environment by passing the region as a parameter to the "instance" method:

```javascript
const client = <PackageClient>.instance('REGION');
```

### Exception and Logging

Helpers are built so hat any calling code/process will not be affected if an exception is thrown.  
However, any exception happening when interacting With AWS services is logged to console as error (SO IT IS IMPORTANT TO MONITOR LOGS WHEN USING THIS LIBRARY).

The methods returning data will return null if an exception is thrown.
THe methods returning boolean will return false if an exception is thrown.

### Service specific usage

Please find below the usage for each services' helper.

#### Secrets Manager

A simplified interface to AWS Secrets Manager.  
Please find usage details [here](secrets-manager.md).

#### S3

A simplified interface to AWS S3.  
Please find usage details [here](s3.md).

#### DynamoDB

A simplified interface to AWS DynamoDB.  
Please find usage details [here](dynamo-db.md).

#### Cognito

A simplified interface to AWS Cognito.  
Please find usage details [here](cognito.md).

#### SNS

A simplified interface to AWS SNS.  
Please find usage details [here](sns.md).
