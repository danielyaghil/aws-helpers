const {
    DeviceFarmClient,
    ListProjectsCommand,
    ListDevicePoolsCommand,
    ListUploadsCommand,
    CreateUploadCommand,
    GetUploadCommand,
    ScheduleRunCommand,
    GetRunCommand,
    StopRunCommand,
    DeleteRunCommand,
    ListJobsCommand,
    ListSuitesCommand,
    ListArtifactsCommand
} = require('@aws-sdk/client-device-farm');
const AWSBase = require('./aws-base');
const axios = require('axios');

class AWSDeviceFarm extends AWSBase {
    constructor(region) {
        super(DeviceFarmClient, region);
    }

    static instance(region = 'us-west-2') {
        return super.instance(AWSDeviceFarm, region);
    }

    //#region lists

    async listProjects() {
        const cmd = new ListProjectsCommand({});
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.projects;
        }
        return null;
    }

    async getProjectArn(projectName) {
        const projects = await this.listProjects();
        if (projects) {
            for (let project of projects) {
                if (project.name == projectName) {
                    return project.arn;
                }
            }
        }
        return null;
    }

    async listDevicePools(projectArn, type = 'PRIVATE') {
        const params = {
            arn: projectArn,
            type: type
        };

        const cmd = new ListDevicePoolsCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.devicePools;
        }
        return null;
    }

    //type : "ANDROID_APP" || "IOS_APP" || "WEB_APP" || "EXTERNAL_DATA" || "APPIUM_JAVA_JUNIT_TEST_PACKAGE" || "APPIUM_JAVA_TESTNG_TEST_PACKAGE" || "APPIUM_PYTHON_TEST_PACKAGE" || "APPIUM_NODE_TEST_PACKAGE" || "APPIUM_RUBY_TEST_PACKAGE" || "APPIUM_WEB_JAVA_JUNIT_TEST_PACKAGE" || "APPIUM_WEB_JAVA_TESTNG_TEST_PACKAGE" || "APPIUM_WEB_PYTHON_TEST_PACKAGE" || "APPIUM_WEB_NODE_TEST_PACKAGE" || "APPIUM_WEB_RUBY_TEST_PACKAGE" || "CALABASH_TEST_PACKAGE" || "INSTRUMENTATION_TEST_PACKAGE" || "UIAUTOMATION_TEST_PACKAGE" || "UIAUTOMATOR_TEST_PACKAGE" || "XCTEST_TEST_PACKAGE" || "XCTEST_UI_TEST_PACKAGE" || "APPIUM_JAVA_JUNIT_TEST_SPEC" || "APPIUM_JAVA_TESTNG_TEST_SPEC" || "APPIUM_PYTHON_TEST_SPEC" || "APPIUM_NODE_TEST_SPEC" || "APPIUM_RUBY_TEST_SPEC" || "APPIUM_WEB_JAVA_JUNIT_TEST_SPEC" || "APPIUM_WEB_JAVA_TESTNG_TEST_SPEC" || "APPIUM_WEB_PYTHON_TEST_SPEC" || "APPIUM_WEB_NODE_TEST_SPEC" || "APPIUM_WEB_RUBY_TEST_SPEC" || "INSTRUMENTATION_TEST_SPEC" || "XCTEST_UI_TEST_SPEC",
    async listUploads(projectArn, type, category = 'PRIVATE') {
        const params = {
            arn: projectArn,
            type: type
        };

        const cmd = new ListUploadsCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.uploads.filter((upload) => upload.category == category);
        }
        return null;
    }

    async listAndroidApps(projectArn) {
        return await this.listUploads(projectArn, 'ANDROID_APP');
    }

    async listIOSApps(projectArn) {
        return await this.listUploads(projectArn, 'IOS_APP');
    }

    async listAppiumNodeJsTestPackages(projectArn) {
        return await this.listUploads(projectArn, 'APPIUM_NODE_TEST_PACKAGE');
    }

    async listAppiumNodeJsTestSpecs(projectArn) {
        return await this.listUploads(projectArn, 'APPIUM_NODE_TEST_SPEC');
    }

    async listJobs(runArn) {
        const input = {
            arn: runArn
        };
        const command = new ListJobsCommand(input);
        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.jobs;
        }

        return null;
    }

    async listSuites(jobArn) {
        const input = {
            arn: jobArn
        };
        const command = new ListSuitesCommand(input);
        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.suites;
        }

        return null;
    }

    async listArtifacts(targetArn, type) {
        const input = {
            arn: targetArn,
            type: type
        };
        const command = new ListArtifactsCommand(input);
        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.artifacts;
        }

        return null;
    }

    async listFiles(targetArn) {
        return await this.listArtifacts(targetArn, 'FILE');
    }

    async listScreenshots(targetArn) {
        return await this.listArtifacts(targetArn, 'SCREENSHOT');
    }

    async listLogs(targetArn) {
        return await this.listArtifacts(targetArn, 'LOG');
    }

    //#endregion

    //#region upload

    getUploadContentType(type) {
        switch (type) {
            case 'ANDROID_APP':
                return 'application/vnd.android.package-archive';
            case 'IOS_APP':
                return 'application/octet-stream';
            case 'APPIUM_NODE_TEST_PACKAGE':
                return 'application/zip';
            case 'APPIUM_NODE_TEST_SPEC':
                return 'text/yml';
            default:
                return 'application/octet-stream';
        }
    }

    async upload(projectArn, type, name) {
        const contentType = this.getUploadContentType(type);

        const params = {
            projectArn: projectArn,
            type: type,
            name: name,
            contentType: contentType
        };

        const cmd = new CreateUploadCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.upload;
        }
        return null;
    }

    async uploadStatus(uploadArn) {
        const params = {
            arn: uploadArn
        };

        const cmd = new GetUploadCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.upload;
        }
    }

    async uploadContentAndValidate(uploadOutput, content, contentType) {
        try {
            const uploadResult = await axios.put(uploadOutput.url, content, {
                headers: {
                    'Content-Type': contentType
                }
            });
            if (uploadResult.status !== 200) {
                throw new Error(`Content could not be sent: ${uploadResult.status} : ${uploadResult.statusText}`);
            }

            let uploadStatus = null;
            let count = 0;
            do {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                uploadStatus = await this.uploadStatus(uploadOutput.arn);
                count++;
            } while (
                uploadStatus &&
                (uploadStatus.status == 'INITIALIZED' || uploadStatus.status == 'PROCESSING') &&
                count < 10
            );

            const output = {
                uploadArn: uploadOutput.arn,
                uploadStatus: uploadStatus.status
            };
            return output;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async uploadNodeSpec(projectArn, name, spec) {
        const uploadOutput = await this.upload(projectArn, 'APPIUM_NODE_TEST_SPEC', name);
        if (uploadOutput && uploadOutput.status == 'INITIALIZED') {
            const output = await this.uploadContentAndValidate(uploadOutput, spec, 'text/yml');
            return output;
        }
        return null;
    }

    async uploadAndroidApp(projectArn, name, apkBuffer) {
        const uploadOutput = await this.upload(projectArn, 'ANDROID_APP', name);
        if (uploadOutput && uploadOutput.status == 'INITIALIZED') {
            const output = await this.uploadContentAndValidate(
                uploadOutput,
                apkBuffer,
                'application/vnd.android.package-archive'
            );
            return output;
        }
        return null;
    }

    async uploadNodePackage(projectArn, name, zipBuffer) {
        const uploadOutput = await this.upload(projectArn, 'APPIUM_NODE_TEST_PACKAGE', name);
        if (uploadOutput && uploadOutput.status == 'INITIALIZED') {
            const output = await this.uploadContentAndValidate(uploadOutput, zipBuffer, 'application/zip');
            return output;
        }
        return null;
    }

    //#endregion

    //#region run tests

    async scheduleRun(name, projectArn, devicePoolArn, appArn, testPackageArn, testSpecArn) {
        const input = {
            name: name,
            devicePoolArn: devicePoolArn,
            projectArn: projectArn,
            appArn: appArn,
            test: {
                type: 'APPIUM_NODE',
                testPackageArn: testPackageArn,
                testSpecArn: testSpecArn
            }
        };
        const command = new ScheduleRunCommand(input);
        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data.run;
        }

        return null;
    }

    async getRun(runArn) {
        const input = {
            arn: runArn
        };
        const command = new GetRunCommand(input);
        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            let output = data.run;
            if (data.run.status == 'COMPLETED') {
                const runArn = data.run.arn;
                const listJobs = await this.listJobs(runArn);
                output['jobs'] = listJobs;
                for (let i = 0; i < listJobs.length; i++) {
                    const job = listJobs[i];
                    const suites = await this.listSuites(job.arn);
                    if (suites) {
                        output.jobs[i]['suites'] = suites;
                        for (let j = 0; j < suites.length; j++) {
                            const suiteArn = suites[j].arn;
                            const logs = await this.listLogs(suiteArn);
                            const screenshots = await this.listScreenshots(suiteArn);
                            const files = await this.listFiles(suiteArn);

                            output.jobs[i].suites[j]['logs'] = logs;
                            output.jobs[i].suites[j]['screenshots'] = screenshots;
                            output.jobs[i].suites[j]['files'] = files;
                        }
                    }
                }
            }
            return output;
        }

        return null;
    }

    async stopRun(runArn) {
        const input = {
            arn: runArn
        };
        const command = new StopRunCommand(input);
        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }

        return false;
    }

    async deleteRun(runArn) {
        const input = {
            arn: runArn
        };
        const command = new DeleteRunCommand(input);
        const data = await this.applyCommand(command);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }

        return false;
    }

    //#endregion
}

module.exports = AWSDeviceFarm;
