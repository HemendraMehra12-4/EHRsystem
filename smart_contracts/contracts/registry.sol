// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Registry {
    enum Role { Patient, CareProvider, Researcher, Regulator }

    struct User {
        Role role;
        bool isRegistered;
    }

    mapping(bytes32 => User) public users;

    function checkUser(bytes32 pub_key) public view returns (bool) {
        return users[pub_key].isRegistered;
    }

    function registerUser(bytes32 _key, string memory _role) public {
        require(!checkUser(_key), "User already registered!");

        bytes32 roleHash = keccak256(abi.encodePacked(_role));
        if (roleHash == keccak256("Patient")) {
            users[_key] = User({role: Role.Patient, isRegistered: true});
        } else if (roleHash == keccak256("CareProvider")) {
            users[_key] = User({role: Role.CareProvider, isRegistered: true});
        } else if (roleHash == keccak256("Researcher")) {
            users[_key] = User({role: Role.Researcher, isRegistered: true});
        } else if (roleHash == keccak256("Regulator")) {
            users[_key] = User({role: Role.Regulator, isRegistered: true});
        } else {
            revert("Invalid role!");
        }
    }

    function getUserRole(bytes32 pub_key) public view returns (Role) {
        require(users[pub_key].isRegistered, "User not registered");
        return users[pub_key].role;
    }
}
