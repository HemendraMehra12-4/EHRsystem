/*
 * Workload module for Caliper to fetch health records by owner address.
 */

"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class GetHealthRecordsByOwnerWorkload extends WorkloadModuleBase {
  constructor() {
    super();
  }

  async submitTransaction() {
    const userAddress = `0x${Math.floor(Math.random() * 1e16)
      .toString(16)
      .padEnd(40, "0")}`;

    const request = {
      contract: "EHRmain",
      verb: "getHealthRecordsByOwner",
      args: [userAddress],
      readOnly: true,
    };

    await this.sutAdapter.sendRequests(request);
  }
}

function createWorkloadModule() {
  return new GetHealthRecordsByOwnerWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
