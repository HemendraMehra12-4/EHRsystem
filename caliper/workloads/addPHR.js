"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class AddPHRDataWorkload extends WorkloadModuleBase {
  constructor() {
    super();
  }

  async submitTransaction() {
    const ipfsCid = `Qm${Math.floor(Math.random() * 1e16).toString(36)}`;
    const dataType = 1;
    const encryptedSymmetricKey =
      "ACKRCRS4ebwvUOhYRMdbfeAs3ZSult6CvrUmVFMiIoFL8ewh3ri2RXw+vQDacD848hqIt2GUtXD8dXrZFOMsX6ZA0EXSroj3W1itSW4crZ7+Scfk42uOw6a+cmcv40SG9L0Mi7SB+7YcoAPwmfd8HBbyi9rzHCiNG5vfo15+d9fA5uvqTRAIlTGFTFQWwkDh1BI3Z2vjKW0C3sL5073MGO3c/uJ10ncnCLUmfsE31FjCvOh8UOZWM8iJmZqHXaPFgUSYg2+FBZMgE7MdulwnltSWIdJoL80DjDZ6cHR8ZyMOSuBoPLbXJQjwH9mkoizCc7lOgalIbRsCvEcwQ3yS9Q==";

    const request = {
      contract: "EHRmain",
      verb: "addPHRData",
      args: [ipfsCid, dataType, encryptedSymmetricKey],
      readOnly: false,
    };

    await this.sutAdapter.sendRequests(request);
  }
}

function createWorkloadModule() {
  return new AddPHRDataWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
