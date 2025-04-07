// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./registry.sol";
import "./NotificationManager.sol";

contract Metadata {
    Registry public registry;
    NotificationManager public notificationManager;

    struct EHRData {  
        string dataType;
        string HI; 
        bytes encKey; // Store encrypted AES key as bytes (not bytes32)
    }

    mapping(bytes32 => EHRData[]) public Data;

    constructor(
        address _registryAddress,
        address _notificationManagerAddress
    ) {
        registry = Registry(_registryAddress);
        notificationManager = NotificationManager(_notificationManagerAddress);
    }

    function addEHRdata(
        bytes32 ownerKey,
        string memory dataType,
        string memory HI,
        bytes memory encKey
    ) public {
        require(registry.checkUser(ownerKey), "Patient/new-owner not registered to system!");
        Data[ownerKey].push(EHRData(dataType, HI, encKey));
        notificationManager.addNotification(ownerKey, "New data added.");
    }

    function searchData(bytes32 userKey) public view returns (string[] memory, string[] memory, bytes[] memory) {
        require(registry.checkUser(userKey), "User not registered to system!");

        uint256 length = Data[userKey].length;
        string[] memory dataTypes = new string[](length);
        string[] memory HIList = new string[](length);
        bytes[] memory encKeys = new bytes[](length);

        for (uint256 i = 0; i < length; i++) {
            dataTypes[i] = Data[userKey][i].dataType;
            HIList[i] = Data[userKey][i].HI;
            encKeys[i] = Data[userKey][i].encKey;
        }

        return (dataTypes, HIList, encKeys);
    }
}
