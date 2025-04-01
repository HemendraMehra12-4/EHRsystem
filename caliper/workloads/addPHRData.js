"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");
const fs = require("fs");
require("dotenv").config({ path: "../.env" });

class AddPHRDataWorkload extends WorkloadModuleBase {
  constructor() {
    super();
    this.txIndex = 0;
    this.results = [];
    this.algorithm = process.env.BESU_CONS_ALGO || "Dinesh";
  }

  async initializeWorkloadModule(
    workerIndex,
    totalWorkers,
    roundIndex,
    roundArguments,
    sutAdapter,
    sutContext
  ) {
    await super.initializeWorkloadModule(
      workerIndex,
      totalWorkers,
      roundIndex,
      roundArguments,
      sutAdapter,
      sutContext
    );
  }

  async submitTransaction() {
    this.txIndex++;
    const ipfsCid = `Qm${this.txIndex.toString(36)}${Date.now().toString(36)}`;
    const dataType = 1;

    const encryptedSymmetricKey = "shortKey";

    const request = {
      contract: "EHRmain",
      verb: "addPHRData",
      args: [ipfsCid, dataType, encryptedSymmetricKey],
      readOnly: false,
    };

    const startTime = Date.now();
    await this.sutAdapter.sendRequests(request);

    const endTime = Date.now();
    const latencyMs = endTime - startTime;
    const latencySec = latencyMs / 1000;
    const throughput = latencySec > 0 ? 1 / latencySec : 0;

    this.results.push({
      txnID: this.txIndex,
      latency: latencyMs,
      throughput: throughput,
      algorithm: this.algorithm,
    });
  }

  async cleanupWorkloadModule() {
    // Updated CSV header with Algorithm field
    const csvHeader = "txnID,Latency(ms),Throughput(TPS),Algorithm\n";
    const csvRows = this.results
      .map(
        (r) =>
          `${r.txnID},${r.latency.toFixed(2)},${r.throughput.toFixed(2)},${
            r.algorithm
          }`
      )
      .join("\n");

    // fs.writeFileSync("benchmark_result.csv", csvHeader + csvRows);
    if (!fs.existsSync("benchmark_result.csv")) {
      fs.writeFileSync("benchmark_result.csv", csvHeader + csvRows);
    } else {
      fs.appendFileSync("benchmark_result.csv", csvRows + "\n");
    }
    // console.log(csvRows);
  }
}

function createWorkloadModule() {
  return new AddPHRDataWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
