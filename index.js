// index.js
const AWSSecrets = require('./helpers/aws-secrets');
const AWSS3 = require('./helpers/aws-s3');
const AWSDynamo = require('./helpers/aws-dynamo');
const AWSCognito = require('./helpers/aws-cognito');
const AWSRedis = require('./helpers/aws-redis');

module.exports.AWSSecrets = AWSSecrets;
module.exports.AWSS3 = AWSS3;
module.exports.AWSDynamo = AWSDynamo;
module.exports.AWSCognito = AWSCognito;
module.exports.AWSRedis = AWSRedis;
