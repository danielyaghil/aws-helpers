const {
    CognitoIdentityProviderClient,
    ListUsersInGroupCommand,
    AdminListGroupsForUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');

class AWSCognito {
    #cognitoClient = null;

    constructor() {
        this.#cognitoClient = new CognitoIdentityProviderClient({
            region: process.env.AWS_REGION
        });
    }

    static instance() {
        if (!AWSCognito.singleton) {
            AWSCognito.singleton = Object.freeze(new AWSCognito());
        }

        return AWSCognito.singleton;
    }

    async #addGroupsToUsers(userPoolId, user) {
        try {
            const input = {
                UserPoolId: userPoolId,
                Username: user.Username
            };
            const command = new AdminListGroupsForUserCommand(input);
            const response = await this.#cognitoClient.send(command);
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
            const response = await this.#cognitoClient.send(command);

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
}

module.exports = AWSCognito;
