const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const AWSBase = require('./aws-base');

class AWSSecret extends AWSBase {
    #cache = null;

    constructor(region) {
        super(SecretsManagerClient, region);
        this.#cache = {};
    }

    static instance(region) {
        return super.instance(AWSSecret, region);
    }

    #getFromCache(secretId) {
        if (!this.#cache[secretId]) {
            return null;
        }

        return this.#cache[secretId];
    }

    #setIntoCache(secretId, value) {
        if (typeof secretId != 'string' || typeof value != 'string') {
            console.error(`Trying to set cache with non string values [${secretId}] : [${value}]`);
            return;
        }

        if (!secretId || !value) {
            return;
        }

        this.#cache[secretId] = value;
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
        data = await this.applyCommand(cmd);

        if (!data) {
            console.error(`Secret: could not retrieve ${secretId} in region ${process.env.AWS_REGION}`);
            return null;
        }

        this.#setIntoCache(secretId, data);

        return JSON.parse(data);
    }

    refresh() {
        this.#cache = {};
    }
}

module.exports = AWSSecret;
