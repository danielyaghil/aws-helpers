const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

class AWSS3 {
    #s3Client = null;

    constructor(region) {
        this.#s3Client = new S3Client({
            region: region ?? process.env.AWS_REGION
        });
    }

    static instance(region) {
        if (!AWSS3.singleton) {
            AWSS3.singleton = Object.freeze(new AWSS3(region));
        }

        return AWSS3.singleton;
    }

    async #applyCommand(command) {
        try {
            const data = await this.#s3Client.send(command);
            if (data) {
                return data;
            }

            return null;
        } catch (error) {
            // error handling.
            console.error(error);
        }
        return null;
    }

    async get(bucket, key) {
        const params = {
            Bucket: bucket,
            Key: key
        };

        const cmd = new GetObjectCommand(params);
        let data = await this.#applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return data;
        }
        return null;
    }

    async put(bucket, key, acl, contentType, stream) {
        const params = {
            Bucket: bucket,
            Key: key,
            ACL: acl,
            ContentType: contentType,
            Body: stream
        };

        const cmd = new PutObjectCommand(params);
        let data = await this.#applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }
        return false;
    }

    async delete(bucket, key) {
        const params = {
            Bucket: bucket,
            Key: key
        };

        const cmd = new DeleteObjectCommand(params);
        let data = await this.#applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 204) {
            return true;
        }
        return false;
    }
}

module.exports = AWSS3;
