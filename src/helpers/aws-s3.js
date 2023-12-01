const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
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

    async get(bucket, key, outputType = 'stream') {
        const params = {
            Bucket: bucket,
            Key: key
        };

        const cmd = new GetObjectCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200 && data.Body) {
            if (outputType == 'txt' || outputType == 'text') {
                return await data.Body.transformToString();
            } else if (outputType == 'byte-array') {
                return await data.Body.transformToByteArray();
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

        const params = {
            Bucket: bucket,
            Key: key,
            ACL: acl,
            ContentType: contentType,
            Body: object
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
