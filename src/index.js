// index.js
const AWSSecrets = require('./helpers/aws-secrets');
const AWSS3 = require('./helpers/aws-s3');
const AWSDynamo = require('./helpers/aws-dynamo-db');
const AWSCognito = require('./helpers/aws-cognito');
const AWSSns = require('./helpers/aws-sns');
const AWSDeviceFarm = require('./helpers/aws-device-farm');

module.exports.SecretsClient = AWSSecrets;
module.exports.S3Client = AWSS3;
module.exports.DynamoDbClient = AWSDynamo;
module.exports.CognitoClient = AWSCognito;
module.exports.SnsClient = AWSSns;
module.exports.DeviceFarmClient = AWSDeviceFarm;
