/*
 * Workload module for Caliper to fetch records approved by a care provider.
 */

"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class GetRecordsByCareProviderWorkload extends WorkloadModuleBase {
  constructor() {
    super();
  }

  async submitTransaction() {
    const careProvider = `0x${Math.floor(Math.random() * 1e16)
      .toString(16)
      .padEnd(40, "0")}`;

    const request = {
      contract: "EHRmain",
      verb: "getRecordsByCareProvider",
      args: [careProvider],
      readOnly: true,
    };

    await this.sutAdapter.sendRequests(request);
  }
}

function createWorkloadModule() {
  return new GetRecordsByCareProviderWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
