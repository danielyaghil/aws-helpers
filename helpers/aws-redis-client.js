const IoRedis = require('ioredis');

class RedisClient {
    #ioRedis = null;
    #local_cache = null;

    constructor() {
        if (process.env.REDIS_ENABLED && process.env.REDIS_ENABLED === 'true') {
            this.#ioRedis = new IoRedis(process.env.REDIS_HOST, process.env.REDIS_PORT);
        } else {
            this.#local_cache = {};
        }
    }

    static instance() {
        if (!RedisClient.singleton) {
            RedisClient.singleton = Object.freeze(new RedisClient());
        }

        return RedisClient.singleton;
    }

    #useRedis() {
        return process.env.REDIS_ENABLED && process.env.REDIS_ENABLED === 'true';
    }

    info() {
        if (!this.#useRedis()) {
            return { redis_enabled: this.#useRedis(), use_local: !this.#useRedis() };
        }
        return this.#ioRedis;
    }

    async get(key) {
        try {
            if (!this.#useRedis()) {
                return this.#local_cache[key];
            }

            let value = await this.#ioRedis.get(key);
            return value;
        } catch (err) {
            console.error(err);
        }
        return null;
    }

    async getJsonObject(key) {
        if (!this.#useRedis()) {
            return await this.get(key);
        }

        let value = await this.get(key);
        if (value) {
            try {
                let json = JSON.parse(value);
                return json;
            } catch (err) {
                console.error(err);
            }
        }
        return null;
    }

    async set(key, value, ttlInMilliseconds) {
        if (!this.#useRedis()) {
            this.#local_cache[key] = value;
            return true;
        }

        let result = '';
        try {
            if (ttlInMilliseconds <= 0) {
                result = await this.#ioRedis.set(key, value);
            } else {
                result = await this.#ioRedis.set(key, value, 'px', ttlInMilliseconds);
            }
            if (result === 'OK') {
                return true;
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    async setJsonObject(key, json, ttlInMilliseconds) {
        if (!this.#useRedis()) {
            return await this.set(key, json, ttlInMilliseconds);
        }

        let value = '';
        if (typeof json === 'object') {
            value = JSON.stringify(json);
        } else {
            console.error(`setJsonObject: ${json} is not a JSON object`);
            return false;
        }
        return await this.set(key, value, ttlInMilliseconds);
    }

    async setTtl(key, ttlInMilliseconds) {
        if (!this.#useRedis()) {
            return true;
        }

        try {
            await this.#ioRedis.pexpire(key, ttlInMilliseconds);
            return true;
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    async getTtl(key) {
        if (!this.#useRedis()) {
            return -1;
        }

        try {
            let ttl = await this.#ioRedis.pttl(key);
            return ttl;
        } catch (err) {
            console.error(err);
        }
        return -1;
    }

    async delete(key) {
        if (!this.#useRedis()) {
            if (this.#local_cache[key]) {
                this.#local_cache[key] = null;
            }
            return true;
        }

        let result = '';
        try {
            result = await this.#ioRedis.del(key);
            if (result === 'OK') {
                return true;
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    }

    async listKeys(pattern = '*') {
        if (!this.#useRedis()) {
            return Object.keys(this.#local_cache);
        }

        let keys = null;
        try {
            keys = await this.#ioRedis.keys(pattern);
        } catch (err) {
            console.error(err);
        }
        return keys;
    }
}

module.exports = RedisClient;
