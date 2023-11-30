const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Readable = require('stream').Readable;
const mime = require('mime');
const AWSBase = require('./aws-base');

class AWSS3 extends AWSBase {
    constructor(region) {
        super(S3Client, region);
    }

    static instance(region) {
        return super.instance(AWSS3, region);
    }

    async #streamToText(stream) {
        return await new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
    }

    async #textToStream(text) {
        return await new Promise((resolve, _) => {
            const stream = new Readable();
            stream.push(text);
            stream.push(null);
            resolve(stream);
        });
    }

    async get(bucket, key, outputType = 'stream') {
        const params = {
            Bucket: bucket,
            Key: key
        };

        const cmd = new GetObjectCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200 && data.Body) {
            if (outputType == 'txt' || outputType == 'text') {
                return await this.#streamToText(data.Body);
            } else {
                return data.Body;
            }
        }
        return null;
    }

    //ACL= "private" || "public-read" || "public-read-write" || "authenticated-read" || "aws-exec-read" || "bucket-owner-read" || "bucket-owner-full-control"
    async put(bucket, key, acl, object) {
        const contentType = mime.getType(key);
        if (!contentType) {
            throw new Error('Content type could not be determined from key');
        }

        let stream = null;
        if (typeof object == 'string') {
            stream = await this.#textToStream(object);
        } else {
            stream = object;
        }

        const params = {
            Bucket: bucket,
            Key: key,
            ACL: acl,
            ContentType: contentType,
            Body: stream
        };

        const cmd = new PutObjectCommand(params);
        let data = await this.applyCommand(cmd);
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
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 204) {
            return true;
        }
        return false;
    }
}

module.exports = AWSS3;
