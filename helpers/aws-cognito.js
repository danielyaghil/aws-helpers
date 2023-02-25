const AWSSecret = require('./aws-secrets');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const axios = require('axios');

class CognitoVerifier {
    #jwtIdVerifier = null;

    constructor() {}

    static instance() {
        if (!CognitoVerifier.singleton) {
            CognitoVerifier.singleton = Object.freeze(new CognitoVerifier());
        }

        return CognitoVerifier.singleton;
    }

    async #getCognitoConf() {
        let cognitoConf = await AWSSecret.instance().get('applitest/Cognito');
        return cognitoConf;
    }

    async init() {
        try {
            let cognitoConf = await this.#getCognitoConf();
            if (cognitoConf) {
                this.#jwtIdVerifier = CognitoJwtVerifier.create({
                    userPoolId: cognitoConf.userPoolId,
                    tokenUse: 'id',
                    clientId: cognitoConf.clientId
                });
                await this.#jwtIdVerifier.hydrate();
            }
        } catch (err) {
            console.error(`CognitoVerifier::Failed to hydrate JWT verifier: ${err}`);
        }
    }

    async getTokens(authCode, url) {
        let cognitoConf = await this.#getCognitoConf();
        if (cognitoConf) {
            let body = `grant_type=authorization_code&client_id=${cognitoConf.clientId}&client_secret=${cognitoConf.clientSecret}&redirect_uri=${url}&code=${authCode}`;
            let options = {
                method: 'POST',
                url: `${cognitoConf.userPoolOauthUrl}/token`,
                data: body
            };
            return await axios
                .request(options)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.error(error);
                    return null;
                });
        } else {
            return null;
        }
    }

    async verifyToken(token, tokenUse) {
        if (!this.#jwtIdVerifier) {
            await this.init();
        }
        if (tokenUse == 'id') {
            try {
                let payload = await this.#jwtIdVerifier.verify(token);
                return payload;
            } catch (err) {
                console.error(`CognitoVerifier::verifyToken ${err}`);
                return null;
            }
        }
    }
}

module.exports = CognitoVerifier;
