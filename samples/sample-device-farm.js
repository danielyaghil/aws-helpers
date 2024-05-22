// this sample demonstrates how to use the DeviceFarmClient class to put and get files from s3
// It requires AWS account with s3 access and a bucket named aws-helpers-sample to be created
// Run: npm run sample-s3

require('dotenv').config({ path: './.env', debug: true });
const fs = require('fs').promises;
//const { DeviceFarmClient } = require('@danielyaghil/aws-helpers');
const { DeviceFarmClient } = require('../src/index');

async function main() {
  const deviceFarmClient = DeviceFarmClient.instance();

  //list projects
  const projects = await deviceFarmClient.listProjects();
  if (!projects) {
    console.error('Error listing projects');
    return;
  } else {
    console.log('Projects:');
    for (let project of projects) {
      console.log(` ${project.name} :  ${project.arn}`);
    }
  }
  console.log('====\n');

  //get project arn
  const projectArn = await deviceFarmClient.getProjectArn(projects[0].name);
  if (!projectArn) {
    console.error('Error getting project arn');
    return;
  } else {
    console.log(`Project Arn "${projects[0].name}": ${projectArn}`);
  }
  console.log('====\n');

  //list device pools
  const devicePools = await deviceFarmClient.listDevicePools(projectArn);
  if (!devicePools) {
    console.error('Error listing device pools');
    return;
  } else {
    console.log('Device Pools:');
    for (let devicePool of devicePools) {
      console.log(` ${devicePool.name} :  ${devicePool.arn}`);
    }
  }
  console.log('====\n');

  //list uploaded application
  const androidAppUploads = await deviceFarmClient.listAndroidApps(projectArn);
  if (!androidAppUploads) {
    console.error('Error listing uploads');
    return;
  } else {
    console.log('Android App Uploads:');
    for (let upload of androidAppUploads) {
      console.log(
        ` ${upload.name} :  ${upload.arn} : ${upload.status} : ${upload.created} : ${upload.type} :${upload.contentType} } : ${upload.category}`
      );
    }
  }
  console.log('====\n');

  //list test packages appium / node
  const testPackages = await deviceFarmClient.listAppiumNodeJsTestPackages(
    projectArn
  );
  if (!testPackages) {
    console.error('Error listing test packages');
    return;
  } else {
    console.log('Test Packages:');
    for (let testPackage of testPackages) {
      console.log(
        `${testPackage.name} :  ${testPackage.arn} : ${testPackage.status} : ${testPackage.created} : ${testPackage.type} :${testPackage.contentType} } : ${testPackage.category}`
      );
    }
  }
  console.log('====\n');

  //list test packages specs appium/ node
  const testSpecs = await deviceFarmClient.listAppiumNodeJsTestSpecs(
    projectArn
  );
  if (!testSpecs) {
    console.error('Error listing test specs');
    return;
  } else {
    console.log('Test Specs:');
    for (let testSpec of testSpecs) {
      console.log(
        `${testSpec.name} :  ${testSpec.arn} : ${testSpec.status} : ${testSpec.created} : ${testSpec.type} :${testSpec.contentType} } : ${testSpec.category}`
      );
    }
  }
  console.log('====\n');

  //upload spec
  const specName = 'spec.yml';
  const specPath = `./assets/${specName}`;
  const specContent = await fs.readFile(specPath, 'utf8');
  const specUpload = await deviceFarmClient.uploadNodeSpec(
    projectArn,
    specName,
    specContent
  );
  console.log('Spec Upload:', JSON.stringify(specUpload));
  console.log('====\n');

  //upload app
  const appName = 'sample.apk';
  const appPath = `./assets/${appName}`;
  const appContent = await fs.readFile(appPath);
  const appUpload = await deviceFarmClient.uploadAndroidApp(
    projectArn,
    appName,
    appContent
  );
  console.log('App Upload:', JSON.stringify(appUpload));
  console.log('====\n');

  //upload test package
  const testPackageName = 'sample.zip';
  const testPackagePath = `./assets/${testPackageName}`;
  const testPackageContent = await fs.readFile(testPackagePath);
  const testPackageUpload = await deviceFarmClient.uploadNodePackage(
    projectArn,
    testPackageName,
    testPackageContent
  );
  console.log('Test Package Upload:', JSON.stringify(testPackageUpload));
  console.log('====\n');

  //schedule run
  let runName = 'Sample Run';
  const devicePoolArn = devicePools[0].arn;
  const appArn = appUpload.uploadArn;
  const testPackageArn = testPackageUpload.uploadArn;
  const testSpecArn = specUpload.uploadArn;
  let runSchedule = await deviceFarmClient.scheduleRun(
    runName,
    projectArn,
    devicePoolArn,
    appArn,
    testPackageArn,
    testSpecArn
  );
  console.log(`Run Schedule:  "${runName}"`, JSON.stringify(runSchedule));
  console.log('====\n');

  //get run
  let run;
  let time = 0;
  do {
    await new Promise((resolve) => setTimeout(resolve, 30000));
    time += 30;
    run = await deviceFarmClient.getRun(runSchedule.arn);
    console.log(`Run status "${runName}": ${run.status} - ${run.result}`);
  } while (run.status !== 'COMPLETED' && time < 390);
  console.log(`Run "${runName}":`, JSON.stringify(run));
  console.log('====\n');

  //schedule run
  runName = 'Sample Run 2';
  runSchedule = await deviceFarmClient.scheduleRun(
    runName,
    projectArn,
    devicePoolArn,
    appArn,
    testPackageArn,
    testSpecArn
  );
  console.log('Run Schedule:', JSON.stringify(runSchedule));
  console.log('====\n');

  //get run
  await new Promise((resolve) => setTimeout(resolve, 15000));
  run = await deviceFarmClient.getRun(runSchedule.arn);
  console.log(`Run status "${runName}": ${run.status} - ${run.result}`);

  //stop run
  const stopRun = await deviceFarmClient.stopRun(runSchedule.arn);
  console.log(`Stop Run "${runName}":`, stopRun);
  console.log('====\n');
  do {
    await new Promise((resolve) => setTimeout(resolve, 15000));
    run = await deviceFarmClient.getRun(runSchedule.arn);
    console.log(`Run status "${runName}": ${run.status} - ${run.result}`);
  } while (run.status !== 'COMPLETED' && time < 360);
  console.log('====\n');

  //delete run
  const deleteRunSuccess = await deviceFarmClient.deleteRun(run.arn);
  console.log(`Delete Run  "${runName}":`, deleteRunSuccess);
  console.log('====\n');
}

main();
