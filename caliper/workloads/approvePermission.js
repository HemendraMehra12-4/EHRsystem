/*
 * Workload module for Caliper to approve permission requests.
 */

"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class ApprovePermissionWorkload extends WorkloadModuleBase {
  constructor() {
    super();
  }

  async submitTransaction() {
    const requestId = `0x${Math.floor(Math.random() * 1e16)
      .toString(16)
      .padEnd(64, "0")}`;

    const request = {
      contract: "EHRmain",
      verb: "approvePermission",
      args: [requestId],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(request);
  }
}

function createWorkloadModule() {
  return new ApprovePermissionWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
