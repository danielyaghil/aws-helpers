const {
    ElasticLoadBalancingV2Client,
    RegisterTargetsCommand,
    DeregisterTargetsCommand
} = require('@aws-sdk/client-elastic-load-balancing-v2');
const AWSBase = require('./aws-base');

class AWSElasticLoadBalancingV2 extends AWSBase {
    constructor(region) {
        super(ElasticLoadBalancingV2Client, region);
    }

    static instance(region) {
        return super.instance(AWSElasticLoadBalancingV2, region);
    }

    async registerTargetsByIps(targetGroupArn, targetIPs) {
        const params = {
            TargetGroupArn: targetGroupArn,
            Targets: targetIPs.map((ip) => ({
                Id: ip
            }))
        };
        const cmd = new RegisterTargetsCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }
        return false;
    }

    async deregisterTargetsByIps(targetGroupArn, targetIPs) {
        const params = {
            TargetGroupArn: targetGroupArn,
            Targets: targetIPs.map((ip) => ({
                Id: ip
            }))
        };
        const cmd = new DeregisterTargetsCommand(params);
        let data = await this.applyCommand(cmd);
        if (data && data.$metadata.httpStatusCode == 200) {
            return true;
        }
        return false;
    }
}

module.exports = AWSElasticLoadBalancingV2;
