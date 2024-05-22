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
