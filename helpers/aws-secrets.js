const {
    SecretsManagerClient,
    GetSecretValueCommand
} = require('@aws-sdk/client-secrets-manager');

class AWSSecret {
    #secretClient = null;
    #cache = null;

    constructor() {
        this.#secretClient = new SecretsManagerClient({
            region: process.env.AWS_REGION
        });
        this.#cache = {};
    }

    static instance() {
        if (!AWSSecret.singleton) {
            AWSSecret.singleton = Object.freeze(new AWSSecret());
        }

        return AWSSecret.singleton;
    }

    #getFromCache(secretId) {
        if (!this.#cache[secretId]) {
            return null;
        }

        return this.#cache[secretId];
    }

    #setIntoCache(secretId, value) {
        if (typeof secretId != 'string' || typeof value != 'string') {
            console.error(
                `Trying to set cache with non string values [${secretId}] : [${value}]`
            );
            return;
        }

        if (!secretId || !value) {
            return;
        }

        this.#cache[secretId] = value;
    }

    async #applyCommand(command) {
        try {
            const data = await this.#secretClient.send(command);
            if (data && data.SecretString) {
                return data.SecretString;
            }
            return null;
        } catch (error) {
            // error handling.
            console.log(error);
        }
        return null;
    }

    async get(secretId) {
        let data = this.#getFromCache(secretId);
        if (data) {
            return JSON.parse(data);
        }

        const params = {
            SecretId: secretId
        };

        const cmd = new GetSecretValueCommand(params);
        data = await this.#applyCommand(cmd);

        if (!data) {
            console.error(
                `Secret: could not retrieve ${secretId} in region ${process.env.AWS_REGION}`
            );
            return null;
        }

        this.#setIntoCache(secretId, data);

        return JSON.parse(data);
    }
}

module.exports = AWSSecret;
