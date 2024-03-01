// This sample demonstrates how to use the DynamoDbClient class
// It requires AWS account with dynamo db access and a table named aws-helpers-sample to be created
// The table should have a primary key named pk of type string and a sort key named sk of type number
// Run: npm run sample-dynamo

require('dotenv').config({ path: '.env', debug: true });
const { v4: uuids4 } = require('uuid');
//const { DynamoDbClient } = require('@danielyaghil/aws-helpers');
const { DynamoDbClient } = require('../src/index');

function reportConsumption(method, parameters, consumedCapacity) {
  console.log(
    `Consumed capacity for ${method} ${parameters}: ${consumedCapacity}`
  );
}

async function main() {
  const tableName = 'aws-helpers-sample';

  console.log(
    `${process.env.AWS_REGION} ${process.env.AWS_ACCESS_KEY_ID} ${process.env.AWS_SECRET_ACCESS_KEY}`
  );

  const dynamoDbClient = DynamoDbClient.instance();
  dynamoDbClient.setConsumedCapacityReporting(true, reportConsumption);

  const pk = uuids4();

  try {
    console.log(`Writing 5 items to table ${tableName} with pk: ${pk}`);
    for (let i = 0; i < 5; i++) {
      const data = {
        pk,
        sk: i,
        message: `Hello World ${i}`,
      };
      const result = await dynamoDbClient.set(tableName, data);
      if (!result) {
        console.error('Error writing to dynamo db');
        return;
      }
    }
    console.log(`Done writing 5 items to table ${tableName} with pk: ${pk}`);

    console.log('=====================');

    console.log(
      `Get specific item from table ${tableName} with pk: ${pk} and sk: 0`
    );
    key = {
      pk: pk,
      sk: 0,
    };
    const item = await dynamoDbClient.get(tableName, key);
    console.log(
      `Done get specific item from table ${tableName} with pk ${pk} and sk: 0: ${JSON.stringify(
        item
      )}`
    );

    //#region query

    console.log('=====================');

    console.log(`Query items from table ${tableName} with pk: ${pk}`);
    let keyCondition = 'pk = :pk';
    let expressionAttributeValues = {
      ':pk': pk,
    };
    items = await dynamoDbClient.query(
      tableName,
      keyCondition,
      null,
      expressionAttributeValues
    );
    console.log(
      `Done querying items from table ${tableName} with pk ${pk}: ${JSON.stringify(
        items
      )}`
    );

    console.log('=====================');

    console.log(
      `Query items from table ${tableName} sorted desc with pk: ${pk}`
    );
    keyCondition = 'pk = :pk';
    expressionAttributeValues = {
      ':pk': pk,
    };
    items = await dynamoDbClient.query(
      tableName,
      keyCondition,
      null,
      expressionAttributeValues,
      'desc'
    );
    console.log(
      `Done querying items from table ${tableName} with pk ${pk} descending: ${JSON.stringify(
        items
      )}`
    );

    console.log('=====================');

    console.log(
      `Query items from table ${tableName} with pk: ${pk} and sk > 2`
    );
    keyCondition = 'pk = :pk and sk > :sk';
    expressionAttributeValues = {
      ':pk': pk,
      ':sk': 2,
    };
    items = await dynamoDbClient.query(
      tableName,
      keyCondition,
      null,
      expressionAttributeValues
    );
    console.log(
      `Done querying items from table ${tableName} with pk ${pk} and sk > 2: ${JSON.stringify(
        items
      )}`
    );

    console.log('=====================');

    console.log(
      `Query items from table ${tableName} with pk: ${pk} and additional filter `
    );
    keyCondition = 'pk = :pk';
    let filter = 'contains(message, :message)';
    expressionAttributeValues = {
      ':pk': pk,
      ':message': '3',
    };
    items = await dynamoDbClient.query(
      tableName,
      keyCondition,
      filter,
      expressionAttributeValues
    );
    console.log(
      `Done querying items from table ${tableName} with pk ${pk} and additional filter: ${JSON.stringify(
        items
      )}`
    );

    //#endregion

    //#region scan

    console.log('=====================');

    console.log(`Scan items from table ${tableName}`);
    items = await dynamoDbClient.scan(tableName);
    console.log(
      `Done scanning items from table ${tableName}: ${JSON.stringify(items)}`
    );

    console.log('=====================');

    console.log(`Scan items from table ${tableName} with additional filter`);
    filter = 'contains(message, :message)';
    expressionAttributeValues = {
      ':message': '3',
    };
    items = await dynamoDbClient.scan(
      tableName,
      filter,
      expressionAttributeValues
    );
    console.log(
      `Done scanning items from table ${tableName} with additional filter: ${JSON.stringify(
        items
      )}`
    );

    //#endregion

    //#region executeStatement

    console.log('=====================');

    console.log(`ExecuteStatement items from table ${tableName}`);
    filter = `pk = '${pk}'`;
    items = await dynamoDbClient.executeStatement(
      tableName,
      filter,
      null,
      'sk',
      'desc'
    );
    console.log(
      `Done ExecuteStatement items from table ${tableName}: ${JSON.stringify(
        items
      )}`
    );

    //#endregion

    //#region Basic operation

    console.log('=====================');

    console.log(`Delete item from table ${tableName} with pk: ${pk} and sk: 0`);

    key = {
      pk: pk,
      sk: 0,
    };

    result = await dynamoDbClient.delete(tableName, key);

    console.log(
      `Done deleting item from table ${tableName} with pk ${pk} and sk: 0: ${result}`
    );

    //#endregion

    console.log('=====================');
  } catch (err) {
    console.log('=====================');
    console.error('Error:', err);
  }
}

main();
