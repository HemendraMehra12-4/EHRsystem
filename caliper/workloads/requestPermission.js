/*
 * Workload module for Caliper to request non-incentive-based permissions.
 */

"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class RequestPermissionWorkload extends WorkloadModuleBase {
  constructor() {
    super();
  }

  async submitTransaction() {
    const owner = `0x${Math.floor(Math.random() * 1e16)
      .toString(16)
      .padEnd(40, "0")}`;
    const ipfsCid = `Qm${Math.floor(Math.random() * 1e16).toString(36)}`;
    const permissionType = Math.floor(Math.random() * 3) + 1; // Example permission type

    const request = {
      contract: "EHRmain",
      verb: "requestNonIncentiveBasedPermission",
      args: [owner, ipfsCid, permissionType.toString()],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(request);
  }
}

function createWorkloadModule() {
  return new RequestPermissionWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
