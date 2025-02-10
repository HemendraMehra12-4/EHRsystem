// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./registry.sol";
import "./NotificationManager.sol";

contract Permission {
    Registry public registry;
    NotificationManager public notificationManager;

    mapping(bytes32 => bytes32) public link;
    mapping(bytes32 => mapping(bytes32 => bool)) public permissions;

    constructor(address _registryAddress, address _notificationManagerAddress) {
        registry = Registry(_registryAddress);
        notificationManager = NotificationManager(_notificationManagerAddress);
    }

    function requestPermission(bytes32 requesterKey, bytes32 granterKey) public {
        require(registry.checkUser(requesterKey), "Requester not registered!");
        notificationManager.addNotification(granterKey, "New permission request.");
    }

    function approvePermission(bytes32 requesterKey, bytes32 granterKey, bool allow) public {
        require(registry.checkUser(granterKey), "Granter not registered!");

        if (allow) {
            link[requesterKey] = granterKey;
            permissions[requesterKey][granterKey] = true;
            notificationManager.addNotification(requesterKey, "Permission granted.");
        } else {
            notificationManager.addNotification(requesterKey, "Permission denied.");
        }
    }

    function checkPermission(bytes32 requesterKey, bytes32 granterKey) public view returns (bool) {
        return permissions[requesterKey][granterKey];
    }
}
