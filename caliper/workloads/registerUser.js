/*
 * Workload module for Caliper to register users in the EHR contract.
 */

"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class RegisterUserWorkload extends WorkloadModuleBase {
  constructor() {
    super();
  }

  async submitTransaction() {
    const role = Math.floor(Math.random() * 3) + 1;
    const publicKeyHash = `0x${Math.floor(Math.random() * 1e16)
      .toString(16)
      .padEnd(64, "0")}`;
    const publicKeyForEncryption = `publicKey-${this.workerIndex}-${this.txIndex}`;

    const request = {
      contract: "EHRmain",
      verb: "registerUser",
      args: [role, publicKeyHash, publicKeyForEncryption],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(request);
  }
}

function createWorkloadModule() {
  return new RegisterUserWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
