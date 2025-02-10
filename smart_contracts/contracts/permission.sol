// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./registry.sol";
import "./NotificationManager.sol";
import "./metadata.sol";

contract Permission {
    Registry public registry;
    NotificationManager public notificationManager;
    Metadata public metadata;

    constructor(address _registryAddress, address _notificationManagerAddress, address _metadataAddress) {
        registry = Registry(_registryAddress);
        notificationManager = NotificationManager(_notificationManagerAddress);
        metadata = Metadata(_metadataAddress);  // Fixed missing semicolon
    }

    function requestPermission(bytes32 requesterKey, bytes32 granterKey) public {
        require(registry.checkUser(requesterKey), "Requester not registered!");
        notificationManager.addNotification(granterKey, bytes32ToString(requesterKey));
        notificationManager.addNotification(granterKey, "New permission request from:");
    }

    function approvePermission(
        bytes32 requesterKey,
        bytes32 granterKey,
        bytes32 newEncKey   // Off-chain encryption
    ) public {
        require(registry.checkUser(granterKey), "Granter not registered!");
        require(registry.checkUser(requesterKey), "Requester not registered!");

        // Fetch existing data from granter
        Metadata.EHRData[] memory granterData = metadata.searchData(granterKey);

        for (uint i = 0; i < granterData.length; i++) {
            // Store re-encrypted key (off-chain encryption required)
            metadata.addEHRdata(
                requesterKey,
                granterData[i].dataType,
                granterData[i].HI,
                newEncKey  // Received from off-chain service
            );
        }

        notificationManager.addNotification(requesterKey, "Permission granted. New data added.");
    }
    function bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
    uint8 i = 0;
    while (i < 32 && _bytes32[i] != 0) {
        i++;
    }
    bytes memory bytesArray = new bytes(i);
    for (i = 0; i < bytesArray.length; i++) {
        bytesArray[i] = _bytes32[i];
    }
    return string(bytesArray);
}

}
