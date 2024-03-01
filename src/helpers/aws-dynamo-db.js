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
    ExecuteStatementCommand,
    QueryCommand
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
    #existingTables = null;
    #capacityReporting = false;
    #capacityReporterCallback = null;

    constructor(region) {
        this.#dynamoDbClient = new DynamoDBClient({
            region: region ?? process.env.AWS_REGION
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

    static instance(region) {
        if (!DB.singleton) {
            DB.singleton = Object.freeze(new DB(region));
        }

        return DB.singleton;
    }

    setConsumedCapacityReporting(capacityReporting, capacityReportingCallback = null) {
        this.#capacityReporting = capacityReporting;
        this.#capacityReporterCallback = capacityReportingCallback;
        console.log(`Report consumed capacity: ${this.#capacityReporting ? 'on' : 'off'}`);
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
            if (this.#capacityReporting) {
                command.input.ReturnConsumedCapacity = 'TOTAL';
                command.clientCommand.input.ReturnConsumedCapacity = 'TOTAL';
            }
            const data = await this.#dynamoDbDocumentClient.send(command);
            if (data.$metadata.httpStatusCode !== 200) {
                console.log(`Error in command : ${data}`);
                return new DbCommandResult(false, data);
            } else {
                return new DbCommandResult(true, data);
            }
        } catch (err) {
            if (err.name == 'ResourceNotFoundException') {
                return new DbCommandResult(true, null);
            } else {
                console.log(err);
                return new DbCommandResult(false, null);
            }
        }
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
        if (!this.#existingTables) {
            const command = new ListTablesCommand({});
            let result = await this.#applyCommand(command);
            if (result.success) {
                if (result.data.TableNames) {
                    this.#existingTables = result.data.TableNames;
                }
            }
        }

        if (this.#existingTables && this.#existingTables.includes(tableName)) {
            return true;
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
            console.log(`${method} table [${tableName}] does not exist`);
            return false;
        }

        return true;
    }

    async set(tableName, item) {
        if (!(await this.#validateDocumentOperation(tableName, item, 'DB:Set'))) {
            return false;
        }

        const params = {
            TableName: tableName,
            Item: item
        };

        const command = new PutCommand(params);
        let result = await this.#applyDocumentCommand(command);
        if (result.success) {
            if (this.#capacityReporting) {
                if (this.#capacityReporterCallback) {
                    this.#capacityReporterCallback(
                        tableName,
                        'set',
                        JSON.stringify(params),
                        result.data.ConsumedCapacity.CapacityUnits
                    );
                }
                console.log(`DB:set - Param ${JSON.stringify(params)}`);
                console.log(`DB:set - Total consumed capacity: ${result.data.ConsumedCapacity.CapacityUnits}`);
            }
            return true;
        }
        return false;
    }

    async get(tableName, key) {
        if (!(await this.#validateDocumentOperation(tableName, key, 'DB:Get'))) {
            return false;
        }

        const params = {
            TableName: tableName,
            Key: key
        };

        const command = new GetCommand(params);
        let result = await this.#applyDocumentCommand(command);
        if (result.success && result.data && result.data.Item) {
            if (this.#capacityReporting) {
                if (this.#capacityReporterCallback) {
                    this.#capacityReporterCallback(
                        tableName,
                        'get',
                        JSON.stringify(params),
                        result.data.ConsumedCapacity.CapacityUnits
                    );
                }
                console.log(`DB:get - Param ${JSON.stringify(params)}`);
                console.log(`DB:get - Total consumed capacity: ${result.data.ConsumedCapacity.CapacityUnits}`);
            }
            return result.data.Item;
        }
        return null;
    }

    async delete(tableName, key) {
        if (!(await this.#validateDocumentOperation(tableName, key, 'DB:Delete'))) {
            return false;
        }

        const params = {
            TableName: tableName,
            Key: key
        };

        const command = new DeleteCommand(params);
        let result = await this.#applyDocumentCommand(command);
        if (result.success) {
            if (this.#capacityReporting) {
                if (this.#capacityReporterCallback) {
                    this.#capacityReporterCallback(
                        tableName,
                        'delete',
                        JSON.stringify(params),
                        result.data.ConsumedCapacity.CapacityUnits
                    );
                }
                console.log(`DB:delete - Param ${JSON.stringify(params)}`);
                console.log(`DB:delete - Total consumed capacity: ${result.data.ConsumedCapacity.CapacityUnits}`);
            }
            return true;
        }
        return false;
    }

    //#endregion

    //#region queries

    async query(tableName, keyCondition, filter = null, parameters, sort = 'asc', index = null, firstPageOnly = false) {
        if (!tableName) {
            console.log(`DB:Query - missing tableName`);
            return null;
        }

        if (!keyCondition) {
            console.log(`DB:Query - missing keyFilter`);
            return null;
        }

        if (!parameters) {
            console.log(`DB:Query - missing parameters`);
            return null;
        }

        if (!(await this.existTable(tableName))) {
            console.log(`DB:Query table [${tableName}] does not exist`);
            return null;
        }

        let params = {
            TableName: tableName,
            KeyConditionExpression: keyCondition,
            ExpressionAttributeValues: parameters
        };
        if (filter) {
            params.FilterExpression = filter;
        }
        if (index) {
            params.IndexName = index;
        }
        if (sort == 'desc') {
            params.ScanIndexForward = false;
        }

        let completedScan = firstPageOnly;
        let queriedItems = [];
        let totalConsumedCapacity = 0;
        do {
            const command = new QueryCommand(params);
            let result = await this.#applyDocumentCommand(command);
            if (result.success) {
                queriedItems = queriedItems.concat(result.data.Items);
                if (this.#capacityReporting) {
                    totalConsumedCapacity += result.data.ConsumedCapacity.CapacityUnits;
                }
            } else {
                return null;
            }

            if (result.data.LastEvaluatedKey) {
                params.ExclusiveStartKey = result.data.LastEvaluatedKey;
            } else {
                completedScan = true;
            }
        } while (!completedScan);

        if (this.#capacityReporting) {
            if (this.#capacityReporterCallback) {
                this.#capacityReporterCallback(tableName, 'query', JSON.stringify(params), totalConsumedCapacity);
            }
            console.log(`DB:Query - Params: ${JSON.stringify(params)}`);
            console.log(`DB:Query - Total consumed capacity: ${totalConsumedCapacity}`);
        }

        return queriedItems;
    }

    async scan(tableName, filter = null, parameters = null, index = null, firstPageOnly = false) {
        if (!tableName) {
            console.log(`DB:Scan - missing tableName`);
            return null;
        }

        if (!(await this.existTable(tableName))) {
            console.log(`DB:Scan table [${tableName}] does not exist`);
            return null;
        }

        let params = {
            TableName: tableName
        };
        if (filter) {
            params.FilterExpression = filter;
            params.ExpressionAttributeValues = parameters;
        }
        if (index) {
            params.IndexName = index;
        }

        let completedScan = firstPageOnly;
        let scannedItems = [];
        let totalConsumedCapacity = 0;
        do {
            const command = new ScanCommand(params);
            let result = await this.#applyDocumentCommand(command);
            if (result.success) {
                scannedItems = scannedItems.concat(result.data.Items);
                if (this.#capacityReporting) {
                    totalConsumedCapacity += result.data.ConsumedCapacity.CapacityUnits;
                }
            } else {
                return null;
            }

            if (result.data.LastEvaluatedKey) {
                params.ExclusiveStartKey = result.data.LastEvaluatedKey;
            } else {
                completedScan = true;
            }
        } while (!completedScan);

        if (this.#capacityReporting) {
            if (this.#capacityReporterCallback) {
                this.#capacityReporterCallback(tableName, 'scan', JSON.stringify(params), totalConsumedCapacity);
            }
            console.log(`DB:Scan - Params: ${JSON.stringify(params)}`);
            console.log(`DB:Scan - Total consumed capacity: ${totalConsumedCapacity}`);
        }

        return scannedItems;
    }

    async executeStatement(
        tableName,
        filter,
        index = null,
        sortBy = null,
        sortDirection = 'asc',
        firstPageOnly = false
    ) {
        if (!tableName || !filter) {
            console.log(`DB:executeStatement - missing tableName or filter`);
            return null;
        }

        const tableNameFormatted = `"${tableName}"`;
        const useIndex = index != null ? `."${index}"` : '';
        let query = `select * from ${tableNameFormatted}${useIndex} where ${filter}`;
        if (sortBy) {
            query += ` order by ${sortBy} ${sortDirection}`;
        }

        let params = {
            Statement: query
        };

        let completedScan = firstPageOnly;
        let selectedItems = [];
        let totalConsumedCapacity = 0;
        do {
            const command = new ExecuteStatementCommand(params);
            let result = await this.#applyDocumentCommand(command);
            if (result.success) {
                selectedItems = selectedItems.concat(result.data.Items);
                if (this.#capacityReporting) {
                    totalConsumedCapacity += result.data.ConsumedCapacity.CapacityUnits;
                }
            } else {
                return null;
            }

            if (result.data.NextToken) {
                params.NextToken = result.data.NextToken;
            } else {
                completedScan = true;
            }
        } while (!completedScan);

        if (this.#capacityReporting) {
            if (this.#capacityReporterCallback) {
                this.#capacityReporterCallback(
                    tableName,
                    'executeStatement',
                    JSON.stringify(params),
                    totalConsumedCapacity
                );
            }
            console.log(`DB:executeStatement - Params: ${JSON.stringify(params)}`);
            console.log(`DB:executeStatement - Total consumed capacity: ${totalConsumedCapacity}`);
        }

        return selectedItems;
    }

    //#endregion
}

module.exports = DB;
