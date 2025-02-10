// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NotificationManager {
    uint8 constant MAX_NOTIFICATIONS = 10;

    mapping(bytes32 => string[MAX_NOTIFICATIONS]) private notifications;
    mapping(bytes32 => uint8) private notificationCounts;

    function addNotification(bytes32 userKey, string memory message) public {
        uint8 count = notificationCounts[userKey];
        notifications[userKey][count % MAX_NOTIFICATIONS] = message;
        notificationCounts[userKey]++;
    }

    function getNotifications(bytes32 userKey) public view returns (string[MAX_NOTIFICATIONS] memory) {
        return notifications[userKey];
    }
}
