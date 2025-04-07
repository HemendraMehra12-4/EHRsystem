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
        metadata = Metadata(_metadataAddress);
    }

    function requestPermission(bytes32 requesterKey, bytes32 granterKey) public {
        require(registry.checkUser(requesterKey), "Requester not registered!");
        require(registry.checkUser(granterKey), "Granter not registered!");

        notificationManager.addNotification(granterKey, "New permission request from:");
        notificationManager.addNotification(granterKey, bytes32ToString(requesterKey));
    }

   function approvePermission(bytes32 granterKey) public view returns (
    string[] memory, // Change from Metadata.DataType[] to string[]
    string[] memory,
    bytes[] memory
) {
    require(registry.checkUser(granterKey), "Granter not registered!");

    return metadata.searchData(granterKey);
}

//missing notification , it can be called off-chain

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
