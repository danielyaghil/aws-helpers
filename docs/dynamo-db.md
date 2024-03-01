# Dynamo DB Helper

A simplified interface to AWS Dynamo DB.

**NOTE**: this is a work in progress and not all methods are supported yet. so if you need a specific methods, please let me know or feel free to enhance ad submit your code.

## Installation

See [Installation section in main page](README.md#installation) for details.

## Authorization

See [Authorization section in main page](README.md#authorization) for details.

## Usage

### Create a client instance

To create a client instance, you need to call the "instance" static method.
It gets the region as an optional parameter (optional) (if not provided, it will be taken from the environment variable AWS_REGION)
It returns a singleton instance of the client.

E.g.:

```javascript
const { DynamoDbClient } = require('@danielyaghil/aws-helpers');
const client = DynamoDbClient.instance();
```

### Analyze consumed capacity

To analyze the consumed capacity of a Dynamo DB operation, you need to call the "setConsumedCapacityReporting" method and set the capacity reporting to true.
After calling, all all to the "get", "set", "delete", "query", "scan" and "executeStatement" methods will log the consumed capacity of the operation to the console in the following format:

```cli
DB:<method> - Param <command param>
DB:<method> - Total consumed capacity: 1
E.g.
DB:delete - Param {"TableName":"aws-helpers-sample","Key":{"pk":"05eed023-3567-47c5-8306-628a39bf0453","sk":0},"ReturnConsumedCapacity":"TOTAL"}
DB:delete - Total consumed capacity: 1
```

On top of it, it is possible to provide a callback function used to collect the consumed capacity data.
The callback function should have the following signature:

```javascript
function <functionName> (method, params, capacity)
With:
- method: the name of the method that was called
- params: the parameters that were passed to the method as string
- capacity: the consumed capacity of the operation
```

Where:

E.g.:

```javascript
const { DynamoDbClient } = require('@danielyaghil/aws-helpers');
const client = DynamoDbClient.instance();

function reportCapacityCallback(method, params, capacity) {
  console.log(`DB:${method} - Param ${params}: ${capacity}`);
}

client.setConsumedCapacityReporting(true, reportCapacityCallback);
```

### Set an entry in a Dynamo DB table

To set an entry in a Dynamo DB table, you need to call the "set" method with the table name and object as parameters.  
The object will be saved as is in the table.  
You need to make sure it includes the primary key of the table and the sort key (if exists).

E.g.:

```javascript
const { DynamoDbClient } = require('@danielyaghil/aws-helpers');
const client = DynamoDbClient.instance();
const success = await client.set('table-name', {
  id: '123',
  name: 'John Doe',
  age: 30,
});
```

### Get an entry from a Dynamo DB table

To get an entry from a Dynamo DB table, you need to call the "get" method with the table name and object key as parameters.  
The object key is an object with the primary key and sort key (if exists) of the table.
It returns the 1st object that matches the key or null if no object was found.

E.g.:

```javascript
const { DynamoDbClient } = require('@danielyaghil/aws-helpers');
const client = DynamoDbClient.instance();
const entry = await client.get('table-name', { pk: '123', sk: 'abc' });
```

### Delete an entry from a Dynamo DB table

To delete an entry from a Dynamo DB table, you need to call the "delete" method with the table name and object key as parameters.
it returns a boolean value indicating if the operation was successful or not.

E.g.:

```javascript
const { DynamoDbClient } = require('@danielyaghil/aws-helpers');
const client = DynamoDbClient.instance();
const success = await client.delete('table-name', { pk: '123', sk: 'abc' });
```

### Query a Dynamo DB table

To query a Dynamo DB table, you need to call the "query" method with the table name, key condition expression and expression attribute values as parameters at minimum.

Method Signature:

```javascript
async query(tableName, keyCondition, filter = null, parameters, sort = 'asc', index = null, firstPageOnly = false)
```

The parameters are defined as below:

- tableName: the name of the table to query
- keyCondition: The key condition expression is a string that includes the key condition expression (e.g. "pk = :pk and sk = :sk").
- filter: an optional condition expression that is used to filter the results and do not include the primary key or sort key (e.g. "age > :age"). Default is null.
- parameters: it is an object that includes the values of all the element defined either in keyCondition or additional filter (e.g. { ':pk': '123', ':sk': 'abc', ':age': 30 }).
- sort: an optional parameter that defines the sort order of the results bad on sort key. It can be either "asc" or "desc". Default is "asc".
- index: an optional name of the index to query (if not provided, the query will be performed on the table itself). Default is null.
- firstPageOnly: an optional boolean parameter that indicates if the query should return only the first page of results or all the results. Default is false.

It returns:

- an array of objects that match the query criteria
- in case of an input error, it returns null (detail of error is logged to console)
- in case of a processing error of if there is no match, it returns an empty array (detail of error is logged to console)

E.g.:

```javascript
const { DynamoDbClient } = require('@danielyaghil/aws-helpers');
const client = DynamoDbClient.instance();
const objects = await client.query('table-name', 'pk = :pk', null, {
  ':pk': '123',
});
```

### Scan a Dynamo DB table

To scan a Dynamo DB table, you need to call the "scan" method with the table name at minimum.  
If called solely with the table name, it will return all the items in the table.

Method Signature:

```javascript
async scan(tableName, filter = null, parameters = null, index = null, firstPageOnly = false) {
```

The parameters are defined as below:

- tableName: the name of the table to scan
- filter: an optional condition expression that is used to filter the results (e.g. "age > :age"). Default is null.
- parameters: it is an object that includes the values of all the element defined in the filter (e.g. { ':age': 30 }).
- index: an optional name of the index to scan (if not provided, the scan will be performed on the table itself). Default is null.
- firstPageOnly: an optional boolean parameter that indicates if the query should return only the first page of results or all the results. Default is false.

It returns:

- an array of objects that match the scan criteria
- in case of an input error, it returns null (detail of error is logged to console)
- in case of a processing error of if there is no match, it returns an empty array (detail of error is logged to console)

E.g.:

```javascript
const { DynamoDbClient } = require('@danielyaghil/aws-helpers');
const client = DynamoDbClient.instance();
const objects = await client.scan();
```

### Execute an "SQL" style query

To execute an "SQL" style query, you need to call the "execute" method with the table name and filter at minimum.

Method signature:

```javascript
async executeStatement(tableName, filter, index = null, sortBy = null, sortDirection = 'asc')
```

The parameters are defined as below:

- tableName: the name of the table to scan
- filter: a mandatory condition expression that is used to filter the results (e.g. "age > :age"). Default is null.
- index: an optional name of the index to scan (if not provided, the scan will be performed on the table itself). Default is null.
- sortBy: an optional name of the attribute to sort the results by. Default is null. if specified, it musts be a property part of the table's key or th us index key.
- sortDirection: an optional parameter that defines the sort order of the results. It can be either "asc" or "desc". Default is "asc".
- firstPageOnly: an optional boolean parameter that indicates if the query should return only the first page of results or all the results. Default is false.

It returns:

- an array of objects that match the scan criteria
- in case of an input error, it returns null (detail of error is logged to console)
- in case of a processing error of if there is no match, it returns an empty array (detail of error is logged to console)

E.g.:

```javascript
const { DynamoDbClient } = require('@danielyaghil/aws-helpers');
const client = DynamoDbClient.instance();
const objects = await client.executeStatement('table-name', 'age > :age');
```

## Full working sample code

You can find full working sample code [here](../samples/sample-sns.js).  
To validate how to run the sample, please refer to the [main samples README](../samples/README.md).
