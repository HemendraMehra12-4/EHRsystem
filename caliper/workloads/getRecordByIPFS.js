"use strict";
"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");
const fs = require("fs");
require("dotenv").config({ path: "../.env" });

class GetRecordByIPFSWorkload extends WorkloadModuleBase {
  constructor() {
    super();
    this.txIndex = 0;
    this.results = [];
    // Determine the consensus algorithm from .env
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
    const recordId = `Qm${Math.floor(Math.random() * 1e16).toString(36)}`;
    const txnID = this.txIndex; // Simple numeric ID
    const startTime = Date.now();

    const request = {
      contract: "EHRmain",
      verb: "getHealthRecordByIpfs",
      args: [recordId],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(request);

    const endTime = Date.now();
    const latencyMs = endTime - startTime; // Latency in milliseconds
    const latencySec = latencyMs / 1000; // Convert to seconds for throughput calculation
    const throughput = latencySec > 0 ? 1 / latencySec : 0; // Throughput in TPS

    this.results.push({
      txnID: txnID,
      latency: latencyMs,
      throughput: throughput,
      algorithm: this.algorithm, // Add algorithm to each result
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
  return new GetRecordByIPFSWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
