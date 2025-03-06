/*
 * Workload module for Caliper to fetch health records by owner address.
 */

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class GetHealthRecordsByOwnerWorkload extends WorkloadModuleBase {

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }

    async submitTransaction() {
        const userAddress = `0x${Math.floor(Math.random() * 1e16).toString(16).padEnd(40, '0')}`;

        const request = {
            contract: this.roundArguments.contract,
            verb: 'getHealthRecordsByOwner',
            args: [userAddress],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(request);
    }
}

function createWorkloadModule() {
    return new GetHealthRecordsByOwnerWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
