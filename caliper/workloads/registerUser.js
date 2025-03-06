/*
 * Workload module for Caliper to register users in the EHR contract.
 */

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class RegisterUserWorkload extends WorkloadModuleBase {

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }

    async submitTransaction() {
        const role = this.txIndex % 3 + 1; // Example to vary roles
        const publicKeyHash = `0x${Math.floor(Math.random() * 1e16).toString(16).padEnd(64, '0')}`;
        const publicKeyForEncryption = `publicKey-${this.workerIndex}-${this.txIndex}`;

        const request = {
            contract: this.roundArguments.contract,
            verb: 'registerUser',
            args: [
                role.toString(),
                publicKeyHash,
                publicKeyForEncryption
            ],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
    }
}

function createWorkloadModule() {
    return new RegisterUserWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
