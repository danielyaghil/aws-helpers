### 0.9.61 (2024-03-02)

- S3Client: Add support for lists in S3Client (based on ListObjectsV2 API)
  You can now list objects in a bucket with different options.
  Details can be found in [s3 helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/s3.md)
- Added DeviceFarmsClient: it provides a set of methods to simplify interaction wwith AWS Device Farm API.  
  Details can be found in [device farm helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/device-farm.md)

### 0.9.50 (2024-02-23)

- DynamoDbClient: Add support for setting consumed capacity reporting.  
  You can now set the consumed capacity reporting to true or false.  
  When set to true, the client will log the consumed capacity of each operation.  
  The default value is false.  
  Details can be found in [dynamo db helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/dynamo-db.md).

### 0.9.46 (2023-12-30)

- Fix documentation and samples for CognitoClient.
- Change parameter name in CognitoClient to match with cognito names
- Adding checks and logs to CognitoClient

### 0.9.45 (2023-12-30)

- Add support for token management in CognitoClient: generateTokenFromAuthCode, generateTokenFromClientCredentials and verify - details can be found in [cognito helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/cognito.md).

### 0.9.61 (2024-03-02)

- Add support for lists in S3Client (based on ListObjectsV2 API): You can now list objects in a bucket with different options. Details can be found in [s3 helper documentation](https://github.com/danielyaghil/aws-helpers/tree/main/docs/s3.md)
