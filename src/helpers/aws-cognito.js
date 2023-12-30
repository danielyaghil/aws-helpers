const {
    CognitoIdentityProviderClient,
    ListUsersInGroupCommand,
    AdminListGroupsForUserCommand,
    ListGroupsCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const AWSBase = require('./aws-base');
const axios = require('axios');

class AWSCognito extends AWSBase {
    constructor(region) {
        super(CognitoIdentityProviderClient, region);
    }

    static instance(region) {
        return super.instance(AWSCognito, region);
    }

    //#region user pool management

    async #addGroupsToUsers(userPoolId, user) {
        try {
            const input = {
                UserPoolId: userPoolId,
                Username: user.Username
            };
            const command = new AdminListGroupsForUserCommand(input);
            const response = await this.applyCommand(command);
            user.Groups = response.Groups;
        } catch (error) {
            console.debug(error);
        }
    }

    async getUsersInGroup(userPoolId, groupName) {
        try {
            const input = {
                UserPoolId: userPoolId,
                GroupName: groupName
            };
            const command = new ListUsersInGroupCommand(input);
            const response = await this.applyCommand(command);

            const users = response.Users;
            if (users && users.length) {
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    await this.#addGroupsToUsers(userPoolId, user);
                }
            }

            return users;
        } catch (error) {
            console.debug(error);
            return [];
        }
    }

    async getAllGroups(userPoolId) {
        try {
            const input = {
                UserPoolId: userPoolId
            };
            const command = new ListGroupsCommand(input);
            const response = await this.applyCommand(command);
            if (response && response.Groups) {
                return response.Groups;
            } else {
                return [];
            }
        } catch (error) {
            console.debug(error);
            return [];
        }
    }

    //#endregion

    //#region token retrieval & validation

    async #getToken(baseUrl, body) {
        let axosOptions = {
            method: 'POST',
            url: `${baseUrl}/oauth2/token`,
            data: body
        };
        return await axios
            .request(axosOptions)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.error(error);
                return null;
            });
    }

    async getTokenFromAuthCode(clientId, clientSecret, redirectUri, code, userPoolBaseUrl, tokenType = 'all') {
        if (!clientId || !clientSecret || !redirectUri || !code || !userPoolBaseUrl) {
            console.log('AWSCognito:getTokenFromAuthCode - missing required parameters');
            return null;
        }

        let body = `grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&code=${code}`;
        let response = await this.#getToken(userPoolBaseUrl, body);
        if (!response) {
            return null;
        }

        let output = {};
        output.expire = response.expires_in;
        switch (tokenType) {
            case 'id':
                output.id_token = response.id_token;
                break;

            case 'access':
                output.access_token = response.access_token;
                break;

            case 'refresh':
                output.refresh_token = response.refresh_token;
                break;

            case 'all':
                output.id_token = response.id_token;
                output.access_token = response.access_token;
                output.refresh_token = response.refresh_token;
                break;
        }

        return output;
    }

    async getTokenFromClientCredentials(clientId, clientSecret, scope, userPoolBaseUrl) {
        if (!clientId || !clientSecret || !scope || !userPoolBaseUrl) {
            console.log('AWSCognito:getTokenFromClientCredentials - missing required parameters');
            return null;
        }

        let body = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}&scope=${scope}`;
        let response = await this.#getToken(userPoolBaseUrl, body);
        if (!response) {
            return null;
        }

        let output = {
            expire: response.expires_in,
            access_token: response.access_token
        };
        return output;
    }

    async verify(userPoolId, clientId, token, tokenType = 'id') {
        const verifier = CognitoJwtVerifier.create({
            userPoolId: userPoolId,
            tokenUse: tokenType,
            clientId: clientId
        });
        await verifier.hydrate();

        try {
            let payload = await verifier.verify(token);
            return payload;
        } catch (err) {
            console.error(`CognitoVerifier::verifyToken ${err}`);
            return null;
        }
    }

    //#endregion
}

module.exports = AWSCognito;
