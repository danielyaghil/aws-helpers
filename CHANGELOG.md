# Changelog

## 0.9.70 (2024-11-11)

- Added SqsClient: it provides a set of methods to simplify interaction with AWS SQS API and existing queues.  
  Details can be found in [sqs helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/sqs.md)

## 0.9.68 (2024-07-23)

- DynamoDbClient: add ability to set consistent read.  
  You can now set the consistent read to true or false.  
  When set to true, the client will use consistent read for all get, query, scan and execute statement operations.  
  The default value is false.  
  Details can be found in [dynamo db helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/dynamo-db.md).

## 0.9.66 (2024-06-07)

- DeviceFarmClient: Update list uploads so that by default it returns only upload with status "SUCCEEDED".  
  You can now pass a filter to get all uploads or only the ones with a specific status.
  This is to avoid returning the detail of the upload if it is still in progress or "FAILED".
  When using generic filter (not category one, you can get any status you require).  
  Details can be found in [device farm helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/device-farm.md)

## 0.9.64 (2024-06-06)

- DeviceFarmClient: Fix upload so that only if it reaches "SUCCEEDED" status it will retuns the detail of uploaded file.  
  This is to avoid returning the detail of the upload if it is still in progress or "FAILED".

## 0.9.63 (2024-06-05)

- S3Client: Fix issue for lists in some cases where the filter returns empty result.

## 0.9.62 (2024-06-04)

- S3Client: Add support for getSignedUrl method.  
  You can now generate a signed URL for a specific object in a bucket.  
  Details can be found in [s3 helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/s3.md)

## 0.9.61 (2024-06-03)

- S3Client: Add support for lists in S3Client (based on ListObjectsV2 API)
  You can now list objects in a bucket with different options.
  Details can be found in [s3 helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/s3.md)
- Added DeviceFarmsClient: it provides a set of methods to simplify interaction wwith AWS Device Farm API.  
  Details can be found in [device farm helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/device-farm.md)

## 0.9.50 (2024-02-23)

- DynamoDbClient: Add support for setting consumed capacity reporting.  
  You can now set the consumed capacity reporting to true or false.  
  When set to true, the client will log the consumed capacity of each operation.  
  The default value is false.  
  Details can be found in [dynamo db helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/dynamo-db.md).

## 0.9.46 (2023-12-30)

- Fix documentation and samples for CognitoClient.
- Change parameter name in CognitoClient to match with cognito names
- Adding checks and logs to CognitoClient

## 0.9.45 (2023-12-30)

- Add support for token management in CognitoClient: generateTokenFromAuthCode, generateTokenFromClientCredentials and verify - details can be found in [cognito helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/cognito.md).
