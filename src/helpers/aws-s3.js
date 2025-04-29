const {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const mime = require('mime');
const AWSBase = require('./aws-base');

class AWSS3 extends AWSBase {
    constructor(region) {
        super(S3Client, region);
        if (mime.getType('x.ipa') != 'application/octet-stream') {
            mime.define({ 'application/octet-stream': ['ipa'] });
        }
    }

    static instance(region) {
        return super.instance(AWSS3, region);
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
            } else if (outputType == 'json') {
                const jsonString = await data.Body.transformToString();
                try {
                    const json = JSON.parse(jsonString);
                    return json;
                } catch (e) {
                    console.error('Error parsing json:', e);
                    return null;
                }
            } else if (outputType == 'byte-array') {
                return await data.Body.transformToByteArray();
            } else {
                return data.Body;
            }
        }
        return null;
    }

    async getSignedUrl(bucket, key, expiryInSeconds) {
        const params = {
            Bucket: bucket,
            Key: key
        };

        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(this.awsClient, command, { expiresIn: expiryInSeconds });
        return url;
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

    async list(bucket, prefix = '', startAfterKey = '', maxKeys = 1000) {
        const params = {
            Bucket: bucket
        };

        if (prefix) {
            params.Prefix = prefix;
        }

        if (startAfterKey) {
            params.StartAfter = startAfterKey;
        }

        let results = [];
        let completed = false;
        do {
            const cmd = new ListObjectsV2Command(params);
            let data = await this.applyCommand(cmd);
            if (data && data.$metadata.httpStatusCode == 200) {
                if (data.Contents && data.Contents.length > 0) {
                    if (maxKeys == 0 || results.length + data.Contents.length < maxKeys) {
                        results = results.concat(data.Contents);
                    } else {
                        results = results.concat(data.Contents.slice(0, maxKeys - results.length));
                    }
                }
            } else {
                break;
            }
            if (data.IsTruncated && data.NextContinuationToken) {
                params.ContinuationToken = data.NextContinuationToken;
            } else {
                completed = true;
            }
        } while (!completed && results.length < maxKeys);

        return results;
    }

    async filterError(error) {
        if (error.code == 'NoSuchBucket') {
            return false;
        }

        return super.filterError(error);
    }
}

module.exports = AWSS3;
