const {
    DynamoDBClient,
    CreateTableCommand,
    DeleteTableCommand,
    ListTablesCommand
} = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
    ScanCommand,
    ExecuteStatementCommand
} = require('@aws-sdk/lib-dynamodb');

class DbCommandResult {
    success = false;
    data = null;

    constructor(success, data) {
        this.success = success;
        this.data = data;
    }
}

class DB {
    #dynamoDbClient = null;
    #dynamoDbDocumentClient = null;

    constructor() {
        this.#dynamoDbClient = new DynamoDBClient({
            region: process.env.AWS_REGION
        });

        const marshallOptions = {
            // Whether to automatically convert empty strings, blobs, and sets to `null`.
            convertEmptyValues: false, // false, by default.
            // Whether to remove undefined values while marshalling.
            removeUndefinedValues: false, // false, by default.
            // Whether to convert typeof object to map attribute.
            convertClassInstanceToMap: true // false, by default.
        };

        const unmarshallOptions = {
            // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
            wrapNumbers: false // false, by default.
        };

        const translateConfig = { marshallOptions, unmarshallOptions };

        this.#dynamoDbDocumentClient = DynamoDBDocumentClient.from(this.#dynamoDbClient, translateConfig);
    }

    static instance() {
        if (!DB.singleton) {
            DB.singleton = Object.freeze(new DB());
        }

        return DB.singleton;
    }

    async #applyCommand(command) {
        try {
            const data = await this.#dynamoDbClient.send(command);
            if (data.$metadata.httpStatusCode !== 200) {
                console.log(`Error in command : ${data}`);
                return new DbCommandResult(false, data);
            } else {
                return new DbCommandResult(true, data);
            }
        } catch (err) {
            console.log(err);
        }
        return new DbCommandResult(false, null);
    }

    async #applyDocumentCommand(command) {
        try {
            const data = await this.#dynamoDbDocumentClient.send(command);
            if (data.$metadata.httpStatusCode !== 200) {
                console.log(`Error in command : ${data}`);
                return new DbCommandResult(false, data);
            } else {
                return new DbCommandResult(true, data);
            }
        } catch (err) {
            console.log(err);
        }
        return new DbCommandResult(false, null);
    }

    //#region table management

    #parseDefinition(inputArray, inputType) {
        let jsonArray = [];
        if (Array.isArray(inputArray)) {
            inputArray.forEach((element) => {
                let parts = element.split(':');
                if (parts.length === 2) {
                    let obj = {};
                    obj['AttributeName'] = parts[0];
                    if (inputType === 'Attributes') {
                        obj['AttributeType'] = parts[1];
                    } else {
                        obj['KeyType'] = parts[1];
                    }
                    jsonArray.push(obj);
                }
            });
        }
        return jsonArray;
    }

    async createTable(tableName, attributes, keySchema) {
        let attributesJson = this.#parseDefinition(attributes, 'Attributes');
        let keySchemaJson = this.#parseDefinition(keySchema, 'KeySchema');

        const params = {
            AttributeDefinitions: attributesJson,
            KeySchema: keySchemaJson,
            BillingMode: 'PAY_PER_REQUEST',
            TableName: tableName
        };

        const command = new CreateTableCommand(params);
        let result = await this.#applyCommand(command);
        if (result.success) {
            return true;
        }
        return false;
    }

    async deleteTable(tableName) {
        const params = {
            TableName: tableName
        };
        const command = new DeleteTableCommand(params);
        let result = await this.#applyCommand(command);
        if (result.success) {
            return true;
        }
        return false;
    }

    async existTable(tableName) {
        const command = new ListTablesCommand({});
        let result = await this.#applyCommand(command);
        if (result.success) {
            if (result.data.TableNames && result.data.TableNames.includes(tableName)) {
                return true;
            }
        }
        return false;
    }

    //#endregion

    //#region simple doc operations

    async #validateDocumentOperation(tableName, obj, method) {
        if (!obj || !tableName) {
            console.log(`${method} - missing table [${tableName}] or item [${JSON.stringify(obj)}] `);
            return false;
        }

        let validTable = await this.existTable(tableName);
        if (!validTable) {
            console.log(`${method} table [${tableName}] dos not exist`);
            return false;
        }

        return true;
    }

    async set(tableName, item) {
        if (!this.#validateDocumentOperation(tableName, item, 'DB:Set')) {
            return false;
        }

        const params = {
            TableName: tableName,
            Item: item
        };

        const command = new PutCommand(params);
        let result = await this.#applyDocumentCommand(command);
        if (result.success) {
            return true;
        }
        return false;
    }

    async get(tableName, key) {
        if (!this.#validateDocumentOperation(tableName, key, 'DB:Get')) {
            return false;
        }

        const params = {
            TableName: tableName,
            Key: key
        };

        const command = new GetCommand(params);
        let result = await this.#applyDocumentCommand(command);
        if (result.success && result.data.Item) {
            return result.data.Item;
        }
        return null;
    }

    async delete(tableName, key) {
        if (!this.#validateDocumentOperation(tableName, key, 'DB:Delete')) {
            return false;
        }

        const params = {
            TableName: tableName,
            Key: key
        };

        const command = new DeleteCommand(params);
        let result = await this.#applyDocumentCommand(command);
        if (result.success) {
            return true;
        }
        return false;
    }

    //#endregion

    //#region queries

    async scanAll(tableName, filter, filterParams) {
        if (!tableName) {
            console.log(`DB:scanAll - missing tableName`);
            return null;
        }

        if (!this.existTable(tableName)) {
            console.log(`DB:ScanAll table [${tableName}] does not exist`);
            return null;
        }

        let params = {
            TableName: tableName
        };
        if (filter) {
            params.FilterExpression = filter;
            params.ExpressionAttributeValues = filterParams;
        }

        const command = new ScanCommand(params);
        let result = await this.#applyDocumentCommand(command);
        if (result.success) {
            return result.data.Items;
        }
        return null;
    }

    async executeStatement(tableName, filter, index, sortBy) {
        if (!tableName || !filter) {
            console.log(`DB:executeStatement - missing tableName or filter`);
            return null;
        }

        let useIndex = index != null ? `."${index}"` : '';
        let query = `select * from ${tableName}${useIndex} where ${filter}`;
        if (sortBy) {
            query += ` order by ${sortBy} desc`;
        }

        let params = {
            Statement: query
        };

        const command = new ExecuteStatementCommand(params);
        let result = await this.#applyDocumentCommand(command);
        if (result.success) {
            return result.data.Items;
        }
        return null;
    }

    //#endregion
}

module.exports = DB;
