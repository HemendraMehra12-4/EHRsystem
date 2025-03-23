"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class GetRecordByIPFSWorkload extends WorkloadModuleBase {
  constructor() {
    super();
  }

  async submitTransaction() {
    const recordId = `Qm${Math.floor(Math.random() * 1e16).toString(36)}`;

    const request = {
      contract: "EHRmain",
      verb: "getHealthRecordByIpfs",
      args: [recordId],
      readOnly: true,
    };

    await this.sutAdapter.sendRequests(request);
  }
}

function createWorkloadModule() {
  return new GetRecordByIPFSWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
