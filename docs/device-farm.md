# Device Farm Helper

A simplified interface to AWS Device Farm API

**NOTE**: this is a work in progress and not all methods are supported yet. so if you need a specific methods, please let me know or feel free to enhance ad submit your code.

## Installation

See [Installation section in main page](README.md#installation) for details.

## Authorization

See [Authorization section in main page](README.md#authorization) for details.

## Usage

### Create a client instance

To create a client instance, you need to call the "instance" static method.
It gets the region as an optional parameter (optional) (if not provided, it will be taken from the environment variable AWS_REGION)
It returns a singleton instance of the client.

E.g.:

```javascript
const { DeviceFarmClient } = require('@danielyaghil/aws-helpers');
const client = DeviceFarmClient.instance();
```

### List projects

List all projects in the account.

```javascript
const { DeviceFarmClient } = require('@danielyaghil/aws-helpers');
const client = DeviceFarmClient.instance();
const projects = await client.listProjects();
```

### List devices pools

List all device pools in a project.

```javascript
const { DeviceFarmClient } = require('@danielyaghil/aws-helpers');
const client = DeviceFarmClient.instance();
const projectArn =
  'arn:aws:devicefarm:us-west-2:123456789012:project:EXAMPLE-GUID-123-456';
const devicePools = client.listDevicePools(projectArn);
```

### List uploaded objects

List all uploaded objects in a project based on upload category and filter
All further list methods call this one seeting the category accordingly and status to 'SUCCEEDED' by default.

Parameters are:

- type: the type of the uploaded object
- status: the status of the uploaded object
- category: the category of the uploaded object (PRIVATE or PUBLIC with PROVATE as default)

Possible types are: 'ANDROID_APP', 'IOS_APP', 'WEB_APP', 'EXTERNAL_DATA', 'APPIUM_NODE_TEST_PACKAGE', 'INSTRUMENTATION_TEST_PACKAGE', 'CALABASH_TEST_PACKAGE', 'UIAUTOMATION_TEST_PACKAGE', 'UIAUTOMATOR_TEST_PACKAGE', 'XCTEST_TEST_PACKAGE', 'XCTEST_UI_TEST_PACKAGE', 'APPIUM_JAVA_JUNIT_TEST_SPEC', 'APPIUM_JAVA_TESTNG_TEST_SPEC', 'APPIUM_PYTHON_TEST_SPEC', 'APPIUM_WEB_JAVA_JUNIT_TEST_SPEC', 'APPIUM_WEB_JAVA_TESTNG_TEST_SPEC', 'APPIUM_WEB_PYTHON_TEST_SPEC', 'CALABASH_TEST_SPEC', 'INSTRUMENTATION_TEST_SPEC', 'UIAUTOMATION_TEST_SPEC', 'UIAUTOMATOR_TEST_SPEC', 'XCTEST_UI_TEST_SPEC'

Possible statuses are: 'INITIALIZED', 'PROCESSING', 'SUCCEEDED', 'FAILED'

```javascript
const { DeviceFarmClient } = require('@danielyaghil/aws-helpers');
const client = DeviceFarmClient.instance();
const projectArn =
  'arn:aws:devicefarm:us-west-2:123456789012:project:EXAMPLE-GUID-123-456';
const devicePools = client.listUploads(projectArn, 'ANDROID_APP', 'SUCCEEDED');
```

### List uploaded applications

List all uploaded applications in a project.

- for android: listAndroidApps()
- for IOS: listIOSApps()

```javascript
const { DeviceFarmClient } = require('@danielyaghil/aws-helpers');
const client = DeviceFarmClient.instance();
const projectArn =
  'arn:aws:devicefarm:us-west-2:123456789012:project:EXAMPLE-GUID-123-456';
const applications = client.listAndroidApps(projectArn);
```

### List uploaded test packages

List all uploaded test packages in a project.

- For Appium Node package: listAppiumNodeJsTestPackages()

```javascript
const { DeviceFarmClient } = require('@danielyaghil/aws-helpers');
const client = DeviceFarmClient.instance();
const projectArn =
  'arn:aws:devicefarm:us-west-2:123456789012:project:EXAMPLE-GUID-123-456';
const testPackages = client.listAppiumNodeJsTestPackages(projectArn);
```

### List test spec

List all test specs in a project.

- for Appium Node package: listAppiumNodeJsTestSpecs()

```javascript
const { DeviceFarmClient } = require('@danielyaghil/aws-helpers');
const client = DeviceFarmClient.instance();
const projectArn =
  'arn:aws:devicefarm:us-west-2:123456789012:project:EXAMPLE-GUID-123-456';
const testSpecs = client.listAppiumNodeJsTestSpecs(projectArn);
```
