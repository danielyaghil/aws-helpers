// index.js
const AWSSecrets = require('./helpers/aws-secrets');
const AWSS3 = require('./helpers/aws-s3');
const AWSDynamo = require('./helpers/aws-dynamo-db');
const AWSCognito = require('./helpers/aws-cognito');
const AWSSns = require('./helpers/aws-sns');
const AWSSqs = require('./helpers/aws-sqs');
const AWSDeviceFarm = require('./helpers/aws-device-farm');
const AWSEcs = require('./helpers/aws-ecs');

module.exports.SecretsClient = AWSSecrets;
module.exports.S3Client = AWSS3;
module.exports.DynamoDbClient = AWSDynamo;
module.exports.CognitoClient = AWSCognito;
module.exports.SnsClient = AWSSns;
module.exports.SqsClient = AWSSqs;
module.exports.DeviceFarmClient = AWSDeviceFarm;
module.exports.EcsClient = AWSEcs;
