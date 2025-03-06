'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class AddPHRDataWorkload extends WorkloadModuleBase {

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }

    async submitTransaction() {
        const ipfsCid = `Qm${Math.floor(Math.random() * 1e16).toString(36)}`;
        const dataType = Math.floor(Math.random() * 5).toString();
        const encryptedSymmetricKey = `${this.workerIndex}-${this.txIndex}`;

        const request = {
            contract: 'EHRmain',
            verb: 'addPHRData',
            args: [ipfsCid, dataType, encryptedSymmetricKey],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
    }
}

function createWorkloadModule() {
    return new AddPHRDataWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
