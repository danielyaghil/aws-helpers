const {
    DynamoDBClient,
    CreateTableCommand,
    DeleteTableCommand,
    ListTablesCommand,
    DescribeTableCommand
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
    #useConsistentRead = false;

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

    setConsistentRead(consistentRead) {
        this.#useConsistentRead = consistentRead;
        console.log(`Consistent read: ${this.#useConsistentRead ? 'on' : 'off'}`);
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
                console.log(
                    `DynamoDbClient::Error in command ${JSON.stringify(command)} : reponse ${JSON.stringify(data)}`
                );
                return new DbCommandResult(false, data);
            } else {
                return new DbCommandResult(true, data);
            }
        } catch (err) {
            if (err.name == 'ResourceNotFoundException') {
                return new DbCommandResult(true, null);
            } else {
                console.log(
                    `DynamoDbClient::exception error ${JSON.stringify(err)} for command ${JSON.stringify(command)}`
                );
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

    async describeTable(tableName) {
        const params = {
            TableName: tableName
        };
        const command = new DescribeTableCommand(params);
        let result = await this.#applyCommand(command);
        if (result.success) {
            const output = {
                tableName: result.data.Table.TableName,
                tableStatus: result.data.Table.TableStatus,
                keySchema: {
                    partitionKey: result.data.Table.KeySchema.find((element) => element.KeyType === 'HASH')
                        .AttributeName,
                    sortKey: result.data.Table.KeySchema.find((element) => element.KeyType === 'RANGE').AttributeName
                }
            };
            return output;
        }
        return null;
    }

    //#endregion

    //#region simple doc operations

    async #validateDocumentOperation(tableName, obj, method) {
        if (!obj || !tableName) {
            console.log(`${method} - missing table [${tableName}] or item`);
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

        if (this.#useConsistentRead) {
            params.ConsistentRead = true;
        }

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

    async query(tableName, keyCondition, filter = null, parameters, sort = 'asc', index = null, maxItems = 0) {
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

        if (this.#useConsistentRead && !index) {
            params.ConsistentRead = true;
        }

        let completedScan = maxItems == 0;
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
                if (maxItems > 0 && queriedItems.length >= maxItems) {
                    completedScan = true;
                    queriedItems = queriedItems.slice(0, maxItems);
                }
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

    async scan(tableName, filter = null, parameters = null, index = null, maxItems = 0) {
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

        if (this.#useConsistentRead && !index) {
            params.ConsistentRead = true;
        }

        let completedScan = maxItems == 0;
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
                if (maxItems > 0 && scannedItems.length >= maxItems) {
                    completedScan = true;
                    scannedItems = scannedItems.slice(0, maxItems);
                }
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

    async executeStatement(tableName, filter, index = null, sortBy = null, sortDirection = 'asc', maxItems = 0) {
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

        if (this.#useConsistentRead && !index) {
            params.ConsistentRead = true;
        }

        let completedScan = maxItems == 0;
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
                if (maxItems > 0 && selectedItems.length >= maxItems) {
                    completedScan = true;
                    selectedItems = selectedItems.slice(0, maxItems);
                }
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

    async truncate(tableName, filter = null, parameters = null, index = null) {
        if (!tableName) {
            console.log(`DB:Truncate - missing tableName`);
            return false;
        }

        if (!(await this.existTable(tableName))) {
            console.log(`DB:Truncate table [${tableName}] does not exist`);
            return false;
        }

        let items = await this.scan(tableName, filter, parameters, index, false);
        if (items) {
            console.log(`DB:Truncate - deleting ${items.length} items from table [${tableName}] - ${new Date()}`);

            const tableDescription = await this.describeTable(tableName);
            if (!tableDescription) {
                console.log(`DB:Truncate - table [${tableName}] does not exist`);
                return false;
            } else {
                console.log(
                    `DB:Truncate - Description table [${tableName}] retrieved: ${JSON.stringify(tableDescription)}`
                );
            }

            for (let i = 0; i < items.length; i++) {
                const key = {};
                key[tableDescription.keySchema.partitionKey] = items[i][tableDescription.keySchema.partitionKey];
                if (tableDescription.keySchema.sortKey) {
                    key[tableDescription.keySchema.sortKey] = items[i][tableDescription.keySchema.sortKey];
                }
                await this.delete(tableName, key);
                if (i % 100 == 0) {
                    console.log(`DB:Truncate - deleted ${i} items - ${new Date()}`);
                } else if (i == items.length - 1) {
                    console.log(`DB:Truncate - deleted ${i} items - ${new Date()}`);
                }
            }
        }
        return true;
    }

    //#endregion
}

module.exports = DB;
