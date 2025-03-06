/*
 * Workload module for Caliper to fetch records accessible by a researcher.
 */

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class GetRecordsForResearcherWorkload extends WorkloadModuleBase {

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }

    async submitTransaction() {
        const requester = `0x${Math.floor(Math.random() * 1e16).toString(16).padEnd(40, '0')}`;
        const recordId = `Qm${Math.floor(Math.random() * 1e16).toString(36)}`;

        const request = {
            contract: this.roundArguments.contract,
            verb: 'getRecordsForResearcher',
            args: [requester, recordId],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(request);
    }
}

function createWorkloadModule() {
    return new GetRecordsForResearcherWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
