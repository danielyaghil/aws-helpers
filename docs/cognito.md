# Cognito Helper

A simplified interface to AWS Cognito.

**NOTE**: this is a work in progress and not all methods are supported yet. so if you need a specific methods, please let me know or feel free to enhance ad submit your code.

## Installation

See [Installation section in main page](README.md#installation) for details.

## Authorization

See [Authorization section in main page](README.md#authorization) for details.

## Usage - Create a client instance

To create a client instance, you need to call the "instance" static method.
It gets the region as an optional parameter (optional) (if not provided, it will be taken from the environment variable AWS_REGION)
It returns a singleton instance of the client.

E.g.:

```javascript
const { CognitoClient } = require('@danielyaghil/aws-helpers');
const client = CognitoClient.instance();
```

## Usage - Tokens

### Get token from authorization code

To generate a token from an authorization code, you need to call the "getTokenFromAuthCode" method with the following parameters:

- clientId: The client ID for the user pool client app.
- clientSecret: The client secret for the user pool client app.
- redirectUri: An authorized redirect URI for the user pool client app - must be the same as the one used to generate the authorization code via the login screen.
- authCode: The authorization code received from the login screen.
- domain: The domain of the user pool as defined in app integration domain (e.g. https://cognito-idp.eu-west-1.amazonaws.com)
- tokenType: The type of token to generate. It can be either "id", "access", "refresh" or "all" (default is "all").

Response is an object with the following properties:

- idToken: The ID token generated from the authorization code.
- accessToken: The access token generated from the authorization code.
- refreshToken: The refresh token generated from the authorization code.
- expiresIn: The number of seconds until the access token expires.
  Note: depending on the tokenType parameter, some of the properties may be missing.

E.g.:

```javascript
const { CognitoClient } = require('@danielyaghil/aws-helpers');
const client = CognitoClient.instance();
const tokenResponse = client.getTokenFromAuthCode(
  'client-id',
  'client-secret',
  'redirect-uri',
  'auth-code',
  'https://user-pool-domain',
  'all'
);
const accessToken = tokenResponse.accessToken;
```

### Get token using client credentials

To generate a token using client credentials, you need to call the "getTokenFromClientCredentials" method with the following parameters:

- clientId: The client ID for the user pool client app.
- clientSecret: The client secret for the user pool client app.
- scope: The scope of the access request as described in https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
- domain: The domain of the user pool as defined in app integration domain (e.g. https://cognito-idp.eu-west-1.amazonaws.com)

Response is an object with the following properties:

- accessToken: The access token generated from the authorization code.
- expiresIn: The number of seconds until the access token expires.

E.g.:

```javascript
const { CognitoClient } = require('@danielyaghil/aws-helpers');
const client = CognitoClient.instance();
const tokenResponse = client.getTokenFromClientCredentials(
  'client-id',
  'client-secret',
  'scope',
  'https://user-pool-domain'
);
const accessToken = tokenResponse.accessToken;
```

### Verify token an get payload

To verify a token and get the payload, you need to call the "verify" method with the following parameters:

- userPoolId: The user pool ID for the user pool.
- clientId: The client ID for the user pool client app.
- token: The token to verify.
- tokenType: The type of token to verify. It can be either "id", "access" or "refresh" (default is "id").

Response is the payload from the token (an object with the claims).

E.g.:

```javascript
const { CognitoClient } = require('@danielyaghil/aws-helpers');
const client = CognitoClient.instance();
const payload = client.verify('user-pool-id', 'client-id', 'token', 'id');
```

## Usage - Admin

### Get all groups in a specific pool

To get all groups in a specific pool, you need to call the "getGroups" method with the pool ID as a parameter.  
It returns an array of groups ; each group is an object with the following properties:

- GroupName (string): The name of the group.,
- UserPoolId (string): The user pool ID for the user pool.
- Description (string): A string containing the description of the group.
- RoleArn (string): The role ARN for the group.
- Precedence (integer): A nonnegative integer value that specifies the precedence of this group relative to the other groups that a user can belong to in the user pool. If a user belongs to two or more groups, it is the group with the highest precedence whose role ARN will be used in the cognito:roles and cognito:preferred_role claims in the user's tokens. Groups with higher Precedence values take precedence over groups with lower Precedence values or with null Precedence values.
- LastModifiedDate (timestamp): The date the group was last modified.
- CreationDate (timestamp): The date the group was created.),

E.g.:

```javascript
const { CognitoClient } = require('@danielyaghil/aws-helpers');
const client = CognitoClient.instance();
const groups = await client.getGroups('user-pool-id');
```

### Get all users in a specific group

To get all users in a specific group, you need to call the "getUsersInGroup" method with the pool ID and group name as parameters.  
It returns an array of users ; each user is an object with the following properties:

- Username (string): The user name of the user you want to describe.
- Enabled (boolean): Specifies whether the user is enabled.
- Attributes ([AttributeType[]](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-cognito-identity-provider/Interface/AttributeType/)) A container with information about the user type attributes.
- MFAOptions ([MFAOptionType[]](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-cognito-identity-provider/Interface/MFAOptionType/)) : The MFA options for the user.
- UserCreateDate(date): The creation date of the user.
- UserLastModifiedDate (date): The last modified date of the user.
- UserStatus ([UserStatusType](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-cognito-identity-provider/TypeAlias/UserStatusType/): The user status. This can be one of the following: UNCONFIRMED,CONFIRMED, ARCHIVED, COMPROMISED, UNKNOWN, RESET_REQUIRED, FORCE_CHANGE_PASSWORD
- Groups: Array of groups the user belongs to.

E.g.:

```javascript
const { CognitoClient } = require('@danielyaghil/aws-helpers');
const client = CognitoClient.instance();
const users = await client.getUsersInGroup('pool-id', 'group-name');
```

## Full working sample code

You can find full working sample code [here](../samples/sample-cognito.js).  
To validate how to run the sample, please refer to the [main samples README](../samples/README.md).
