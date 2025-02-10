// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./registry.sol";
import "./permission.sol";
import "./NotificationManager.sol";

contract Metadata {
    Registry public registry;
    Permission public permission;
    NotificationManager public notificationManager;

    enum DataType { BloodTest, XRay, MRI, Prescription }

    struct Data {
        bytes32 key;
        DataType dataType;
        bytes32 hashIndex;
        bytes32 encKey;
    }

    mapping(bytes32 => Data[]) public patientData;

    constructor(
        address _registryAddress,
        address _permissionAddress,
        address _notificationManagerAddress
    ) {
        registry = Registry(_registryAddress);
        permission = Permission(_permissionAddress);
        notificationManager = NotificationManager(_notificationManagerAddress);
    }

    function addEHRdata(
        bytes32 userKey,
        bytes32 key,
        DataType dataType,
        bytes32 hashIndex,
        bytes32 encKey
    ) public {
        require(
            registry.getUserRole(userKey) == Registry.Role.CareProvider,
            "Not authorized!"
        );

        patientData[userKey].push(Data(key, dataType, hashIndex, encKey));
        notificationManager.addNotification(userKey, "New data added.");
    }

    function getPatientData(bytes32 userKey) public returns (Data[] memory) {
        require(
            permission.checkPermission(userKey, userKey),
            "Access denied!"
        );

        notificationManager.addNotification(userKey, "Your data was accessed.");
        return patientData[userKey];
    }
}
