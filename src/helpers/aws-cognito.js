const {
    CognitoIdentityProviderClient,
    ListUsersInGroupCommand,
    AdminListGroupsForUserCommand,
    ListGroupsCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const AWSBase = require('./aws-base');

class AWSCognito extends AWSBase {
    client = null;

    constructor(region) {
        super(CognitoIdentityProviderClient, region);
    }

    static instance(region) {
        return super.instance(AWSCognito, region);
    }

    async #addGroupsToUsers(userPoolId, user) {
        try {
            const input = {
                UserPoolId: userPoolId,
                Username: user.Username
            };
            const command = new AdminListGroupsForUserCommand(input);
            const response = await this.client.send(command);
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
}

module.exports = AWSCognito;
