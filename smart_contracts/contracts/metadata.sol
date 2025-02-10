// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./registry.sol";
import "./NotificationManager.sol";

contract Metadata {
    Registry public registry;
    NotificationManager public notificationManager;

    enum DataType { COVID, Blood, Echo, XRay, MRI, Prescription }

    struct EHRData {  
        DataType dataType;
        bytes32 HI;
        bytes32 encKey; // Symmetric key used to encrypt raw data
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
        DataType dataType,
        bytes32 HI,
        bytes32 encKey
    ) public {
        require(registry.checkUser(ownerKey), "Patient/new-owner not registered to system!");
        Data[ownerKey].push(EHRData(dataType, HI, encKey));
        notificationManager.addNotification(ownerKey, "New data added.");
    }

    function searchData(bytes32 userKey) public view returns (EHRData[] memory) {
        require(registry.checkUser(userKey), "User not registered to system!");
        return Data[userKey];
    }
}
