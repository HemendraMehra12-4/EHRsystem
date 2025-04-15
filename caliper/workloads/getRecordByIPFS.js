"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");
const fs = require("fs");
require("dotenv").config({ path: "../.env" });

class GetRecordByIPFSWorkload extends WorkloadModuleBase {
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
    const recordId = `Qm${Math.floor(Math.random() * 1e16).toString(36)}`;
    const startTime = Date.now();

    const request = {
      contract: "EHRmain",
      verb: "getHealthRecordByIpfs",
      args: [recordId],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(request);

    const totalTxns = 1000; // Change this based on the simple-benchmark.yaml file
    const endTime = Date.now();
    const latencyMs = endTime - startTime;
    const latencySec = latencyMs / 1000;
    const throughput = latencySec > 0 ? totalTxns / latencySec : 0;

    this.results.push({
      latency: latencyMs,
      throughput: throughput,
      algorithm: this.algorithm,
    });
  }

  async cleanupWorkloadModule() {
    const csvHeader = "Latency(ms),Throughput(TPS),Algorithm\n";
    const csvRows = this.results
      .map(
        (r) =>
          `${r.latency.toFixed(2)},${r.throughput.toFixed(2)},${r.algorithm}`
      )
      .join("\n");

    if (!fs.existsSync("benchmark_result.csv")) {
      fs.writeFileSync("benchmark_result.csv", csvHeader + csvRows);
    } else {
      fs.appendFileSync("benchmark_result.csv", csvRows + "\n");
    }
  }
}

function createWorkloadModule() {
  return new GetRecordByIPFSWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
