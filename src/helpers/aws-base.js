class AWSBase {
    #awsClient = null;

    constructor(AWS_CLIENT, region) {
        this.#awsClient = new AWS_CLIENT({
            region: region ?? process.env.AWS_REGION
        });
    }

    static instance(AWS_HELPER_CLASS, region) {
        if (!AWSBase[AWS_HELPER_CLASS.name]) {
            AWSBase[AWS_HELPER_CLASS.name] = Object.freeze(new AWS_HELPER_CLASS(region));
        }

        return AWSBase[AWS_HELPER_CLASS.name];
    }

    get awsClient() {
        return this.#awsClient;
    }

    async processData(data) {
        return data;
    }

    async filterError(error) {
        if (error.$metadata.httpStatusCode == 404) {
            return true;
        }
        return false;
    }

    async applyCommand(command) {
        try {
            const data = await this.#awsClient.send(command);
            if (data) {
                return await this.processData(data);
            }
        } catch (error) {
            // error handling.
            const isFiletered = await this.filterError(error);
            if (!isFiletered) {
                console.error(error);
            }
        }
        return null;
    }

    get client() {
        return this.#awsClient;
    }
}

module.exports = AWSBase;
