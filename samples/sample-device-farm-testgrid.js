// this sample demonstrates how to use the DeviceFarmClient class to put and get files from s3
// It requires AWS account with s3 access and a bucket named aws-helpers-sample to be created
// Run: npm run sample-s3

require('dotenv').config({ path: './.env', debug: true });
const fs = require('fs').promises;
//const { DeviceFarmClient } = require('@danielyaghil/aws-helpers');
const { DeviceFarmClient } = require('../src/index');

async function main() {
  const deviceFarmClient = DeviceFarmClient.instance();

  // const pjArn =
  //   'arn:aws:devicefarm:us-west-2:541633691396:testgrid-project:81d49a17-a7e0-4965-8a02-d71053cfbe25';

  const pjArn =
    'arn:aws:devicefarm:us-west-2:750019508495:testgrid-project:4cb96a95-94ed-4912-9718-f3e491557232';

  const tg = await deviceFarmClient.createTestGridSession(pjArn, 300);
  console.log(`TestGrid Session: ${JSON.stringify(tg)}`);

  const listSessions = await deviceFarmClient.listTestGridSessions(pjArn);
  console.log(`TestGrid Sessions: ${JSON.stringify(listSessions)}`);

  // const sessionArn =
  //   'arn:aws:devicefarm:us-west-2:541633691396:testgrid-session:81d49a17-a7e0-4965-8a02-d71053cfbe25/681e255d1ea2a81ef232bd7b7deeabdb';
  // const session = await deviceFarmClient.getTestGridSession(sessionArn);
  // console.log(`TestGrid Session: ${JSON.stringify(session)}`);

  // const artifacts = await deviceFarmClient.listTestGridSessionArtifacts(
  //   sessionArn
  // );
  // console.log(`TestGrid Session Artifacts: ${JSON.stringify(artifacts)}`);
}

main();
