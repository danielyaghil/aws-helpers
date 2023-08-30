const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime');

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
            console.debug(error);
        }
        return null;
    }

    async #streamToString(stream) {
        return await new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
    }

    async get(bucket, key, outputType = 'stream') {
        const params = {
            Bucket: bucket,
            Key: key
        };

        const cmd = new GetObjectCommand(params);
        let data = await this.#applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200 && data.Body) {
            if (outputType == 'txt') {
                return await this.#streamToString(data.Body);
            } else {
                return data.Body;
            }
        }
        return null;
    }

    //ACL= "private" || "public-read" || "public-read-write" || "authenticated-read" || "aws-exec-read" || "bucket-owner-read" || "bucket-owner-full-control"
    async put(bucket, key, acl, stream) {
        const contentType = mime.getType(key);
        if (!contentType) {
            throw new Error('Content type could not be determined from key');
        }

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
