// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EHRmain {
    // User roles
    enum Role {
        NONE,
        PATIENT,
        PROVIDER,
        RESEARCHER
    }

    // Data types
    enum DataType {
        EHR,
        PHR,
        LAB_RESULT,
        PRESCRIPTION,
        IMAGING
    }

    // Permission types
    enum PermissionType {
        NONE,
        INCENTIVEBASED,
        NONINCENTIVEBASED
    }

    // Status of permission requests
    enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED,
        EXPIRED
    }

    // Structs for storing user data
    struct User {
        address userAddress;
        Role role;
        uint256 registrationDate;
        bytes32 publicKeyHash;
    }

    // Struct for health records metadata
    struct HealthRecord {
        address owner;
        string ipfsCid; // Replaced dataHash with ipfsCid
        DataType dataType;
        string encryptedSymmetricKey;
        uint256 timestamp;
        bool isValid;
        address provider;
    }

    struct approvedRecord {
        address owner;
        address careProvider;
        string ipfsCid;
        DataType dataType;
        string encryptedSymmetricKey;
        uint256 approvedDate;
        uint256 expiryDate;
        bool status;
    }
    // Struct for permission requests
    struct PermissionRequest {
        address requester;
        address owner;
        bytes32 requestId; // Change to bytes32
        string ipfsCid;
        PermissionType permissionType;
        RequestStatus status;
        uint256 requestDate;
        uint256 expiryDate;
        uint incentiveAmount;
        bool isIncentiveBased;
    }

    // Struct to hold public and private keys
    struct KeyPair {
        string publicKeyForEncryption;
    }

    // State variables
    mapping(address => User) public users;
    mapping(string => HealthRecord) public healthRecords; // Changed data type from bytes32 to string
    mapping(bytes32 => PermissionRequest) public permissionRequests; // Changed data type from bytes32 to string
    mapping(address => mapping(string => mapping(address => bool)))
        public permissions;
    // Mapping to store approved records with careProvider as the key
    mapping(address => approvedRecord[]) public approvedRecords;
    mapping(string => approvedRecord) public approvedRecordsByID;

    // Mapping to store health record IPFS CIDs by owner address
    mapping(address => string[]) public ownerToHealthRecords;

    // Mapping to store the keyPair (PU,PK) of a user ( here one of the key is encrypted so it is secure)
    mapping(address => KeyPair) public userKeys;

    // System variables
    address public systemOwner;
    uint256 public totalUsers;
    uint256 public totalRecords;
    uint256 public totalRequests;
    bytes32[] public permissionRequestIds; // Array to keep track of keys (ids)

    // Events
    event UserRegistered(address indexed userAddress, Role role);
    event HealthRecordAdded(
        string indexed ipfsCid,
        address indexed owner,
        DataType dataType
    );
    event PermissionRequested(
        bytes32 requestId,
        address indexed requester,
        address indexed owner
    );
    event PermissionGranted(
        bytes32 requestId,
        address indexed requester,
        address indexed owner
    );
    event PermissionRevoked(
        string indexed ipfsCid,
        address indexed revokedUser
    );
    event EmergencyAccess(
        address indexed provider,
        address indexed patient,
        uint256 timestamp
    );

    // Event to notify when a new record is added
    event ApprovedRecordAdded(
        address indexed owner,
        address indexed careProvider,
        string ipfsCid,
        DataType dataType,
        string encryptedSymmetricKey,
        uint256 approvedDate,
        uint256 expiryDate,
        bool status
    );

    // Modifiers
    modifier onlySystemOwner() {
        require(
            msg.sender == systemOwner,
            "Only system owner can call this function"
        );
        _;
    }

    modifier onlyProvider() {
        require(
            users[msg.sender].role == Role.PROVIDER,
            "Only healthcare providers can call this function"
        );
        _;
    }

    modifier onlyPatient() {
        require(
            users[msg.sender].role == Role.PATIENT,
            "Only patients can call this function"
        );
        _;
    }

    modifier recordExists(string memory _ipfsCid) {
        require(healthRecords[_ipfsCid].isValid, "Record does not exist");
        _;
    }

    // Constructor
    constructor() {
        systemOwner = msg.sender;
        totalUsers = 0;
        totalRecords = 0;
        totalRequests = 0;
    }

    // Registry Contract Functions
    function registerUser(
        Role _role,
        bytes32 _publicKeyHash,
        string calldata _publicKeyForEncryption
    )
        external
        returns (
            // string memory _encryptedPrivateKey
            bool
        )
    {
        require(
            users[msg.sender].userAddress == address(0),
            "User already registered"
        );
        require(_role != Role.NONE, "Invalid role");

        users[msg.sender] = User({
            userAddress: msg.sender,
            role: _role,
            registrationDate: block.timestamp,
            publicKeyHash: _publicKeyHash
        });

        userKeys[msg.sender] = KeyPair({
            publicKeyForEncryption: _publicKeyForEncryption
            // encryptedPrivateKey: _encryptedPrivateKey
        });

        totalUsers++;
        emit UserRegistered(msg.sender, _role);
        return true;
    }

    function getKeyPair(
        address userAddress
    ) external view returns (string memory) {
        require(
            users[userAddress].userAddress != address(0),
            "User not registered"
        );
        KeyPair memory keys = userKeys[userAddress];
        return (keys.publicKeyForEncryption);
    }

    function checkUser(address _userAddress) public view returns (Role) {
        return users[_userAddress].role;
    }

    // Data Contract Functions
    function addEHRData(
        address _patientAddress,
        string memory _ipfsCid,
        DataType _dataType,
        string memory _encryptedSymmetricKey
    ) external onlyProvider returns (bool) {
        require(_patientAddress != address(0), "Invalid patient address");
        require(
            bytes(healthRecords[_ipfsCid].ipfsCid).length == 0,
            "Record already exists"
        );

        Role patientRole = checkUser(_patientAddress);
        require(patientRole == Role.PATIENT, "Invalid patient");

        healthRecords[_ipfsCid] = HealthRecord({
            owner: _patientAddress,
            ipfsCid: _ipfsCid,
            dataType: _dataType,
            encryptedSymmetricKey: _encryptedSymmetricKey,
            timestamp: block.timestamp,
            isValid: true,
            provider: msg.sender
        });

        ownerToHealthRecords[_patientAddress].push(_ipfsCid); // Store the CID for the owner

        totalRecords++;
        emit HealthRecordAdded(_ipfsCid, _patientAddress, _dataType);
        return true;
    }

    function addPHRData(
        string memory _ipfsCid,
        DataType _dataType,
        string calldata _encryptedSymmetricKey
    ) external onlyPatient returns (bool) {
        require(
            bytes(healthRecords[_ipfsCid].ipfsCid).length == 0,
            "Record already exists"
        );

        healthRecords[_ipfsCid] = HealthRecord({
            owner: msg.sender,
            ipfsCid: _ipfsCid,
            dataType: _dataType,
            encryptedSymmetricKey: _encryptedSymmetricKey,
            timestamp: block.timestamp,
            isValid: true,
            provider: msg.sender
        });

        ownerToHealthRecords[msg.sender].push(_ipfsCid); // Store the CID for the owner

        totalRecords++;
        emit HealthRecordAdded(_ipfsCid, msg.sender, _dataType);
        return true;
    }

    // Function to add a new approved record
    function addApprovedRecord(
        address _owner,
        address _careProvider,
        string memory _ipfsCid,
        DataType _dataType,
        string memory _encryptedSymmetricKey,
        uint256 _approvedDate,
        uint256 _expiryDate
    ) public {
        require(_owner != address(0), "Invalid owner address");
        require(_careProvider != address(0), "Invalid care provider address");
        require(bytes(_ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(
            _approvedDate <= block.timestamp,
            "Approved date cannot be in the future"
        );
        require(
            _expiryDate > _approvedDate,
            "Expiry date must be after approved date"
        );

        // Add the record to the careProvider mapping
        approvedRecord memory newRecord = approvedRecord({
            owner: _owner,
            careProvider: _careProvider,
            ipfsCid: _ipfsCid,
            dataType: _dataType,
            encryptedSymmetricKey: _encryptedSymmetricKey,
            approvedDate: block.timestamp,
            expiryDate: _expiryDate,
            status: true // Active by default
        });

        approvedRecords[_careProvider].push(newRecord);
        approvedRecordsByID[_ipfsCid] = approvedRecord({
            owner: _owner,
            careProvider: _careProvider,
            ipfsCid: _ipfsCid,
            dataType: _dataType,
            encryptedSymmetricKey: _encryptedSymmetricKey,
            approvedDate: block.timestamp,
            expiryDate: _expiryDate,
            status: true // Active by default
        });

        // Emit the event
        emit ApprovedRecordAdded(
            _owner,
            _careProvider,
            _ipfsCid,
            _dataType,
            _encryptedSymmetricKey,
            _approvedDate,
            _expiryDate,
            true
        );
    }

    // Function to get all records for a specific care provider

    // Permission Contract Functions
    function requestNonIncentiveBasedPermission(
        address _owner,
        string memory _ipfsCid,
        PermissionType _permissionType
    ) external recordExists(_ipfsCid) returns (bytes32) {
        require(_owner != address(0), "Invalid owner address");
        require(
            _permissionType != PermissionType.NONE,
            "Invalid permission type"
        );
        require(
            keccak256(abi.encodePacked(healthRecords[_ipfsCid].owner)) ==
                keccak256(abi.encodePacked(_owner)),
            "Invalid record owner"
        );

        bytes32 requestId = keccak256(
            abi.encodePacked(msg.sender, _owner, _ipfsCid, block.timestamp)
        );

        permissionRequests[requestId] = PermissionRequest({
            requester: msg.sender,
            owner: _owner,
            requestId: requestId, // Store as bytes32
            ipfsCid: _ipfsCid,
            permissionType: _permissionType,
            status: RequestStatus.PENDING,
            requestDate: block.timestamp,
            expiryDate: block.timestamp + 30 days,
            incentiveAmount: 0,
            isIncentiveBased: false
        });

        totalRequests++;
        emit PermissionRequested(requestId, msg.sender, _owner);
        permissionRequestIds.push(requestId);
        return requestId;
    }

    function requestIncentiveBasedPermission(
        address _owner,
        string memory _ipfsCid,
        PermissionType _permissionType
    ) external payable recordExists(_ipfsCid) returns (bytes32) {
        require(_owner != address(0), "Invalid owner address");
        require(
            _permissionType != PermissionType.NONE,
            "Invalid permission type"
        );
        require(msg.value > 0, "Incentive amount required");
        require(
            keccak256(abi.encodePacked(healthRecords[_ipfsCid].owner)) ==
                keccak256(abi.encodePacked(_owner)),
            "Invalid record owner"
        );

        bytes32 requestId = keccak256(
            abi.encodePacked(msg.sender, _owner, _ipfsCid, block.timestamp)
        );

        permissionRequests[requestId] = PermissionRequest({
            requester: msg.sender,
            owner: _owner,
            requestId: requestId, // Store as bytes32
            ipfsCid: _ipfsCid,
            permissionType: _permissionType,
            status: RequestStatus.PENDING,
            requestDate: block.timestamp,
            expiryDate: block.timestamp + 30 days,
            incentiveAmount: 0,
            isIncentiveBased: true
        });

        totalRequests++;
        emit PermissionRequested(requestId, msg.sender, _owner);
        permissionRequestIds.push(requestId);
        return requestId;
    }

    function getPendingRequestsForPatient(
        address patient
    ) external view returns (PermissionRequest[] memory) {
        uint256 count = 0;

        // Count how many requests are pending for the patient
        for (uint256 i = 0; i < permissionRequestIds.length; i++) {
            bytes32 requestId = permissionRequestIds[i];
            PermissionRequest storage request = permissionRequests[requestId];

            if (
                request.owner == patient
                // &&
                // request.status == RequestStatus.PENDING
            ) {
                count++;
            }
        }

        // Create an array to hold the pending requests
        PermissionRequest[] memory pendingRequests = new PermissionRequest[](
            count
        );
        uint256 index = 0;

        for (uint256 i = 0; i < permissionRequestIds.length; i++) {
            bytes32 requestId = permissionRequestIds[i];
            PermissionRequest storage request = permissionRequests[requestId];

            if (
                request.owner == patient
                // &&
                // request.status == RequestStatus.PENDING
            ) {
                pendingRequests[index] = request;
                index++;
            }
        }
        return pendingRequests;
    }

    function approvePermission(
        bytes32 _requestId // Added encrypted symmetric key as parameter
    ) external returns (bool) {
        PermissionRequest storage request = permissionRequests[_requestId];
        require(request.owner == msg.sender, "Only owner can approve");
        require(
            request.status == RequestStatus.PENDING,
            "Invalid request status"
        );
        require(block.timestamp <= request.expiryDate, "Request expired");

        request.status = RequestStatus.APPROVED;
        // Update permissions mapping to grant access
        permissions[request.owner][request.ipfsCid][request.requester] = true;

        emit PermissionGranted(_requestId, request.requester, request.owner);
        return true;
    }

    function revokePermission(
        string memory _ipfsCid,
        address _user
    ) external recordExists(_ipfsCid) onlySystemOwner returns (bool) {
        permissions[healthRecords[_ipfsCid].owner][_ipfsCid][_user] = false;
        emit PermissionRevoked(_ipfsCid, _user);
        return true;
    }

    // Access control
    function getHealthRecordsByOwner(
        address userAddress
    ) public view returns (HealthRecord[] memory) {
        uint256 totalRecordsForOwner = ownerToHealthRecords[userAddress].length;
        HealthRecord[] memory records = new HealthRecord[](
            totalRecordsForOwner
        );

        // Loop through each record of the owner and populate the HealthRecord array
        for (uint256 i = 0; i < totalRecordsForOwner; i++) {
            string memory ipfsCid = ownerToHealthRecords[userAddress][i];
            HealthRecord memory record = healthRecords[ipfsCid];
            records[i] = record;
        }
        return records;
    }

    function getHealthRecordByIpfs(
        string memory recordId
    )
        public
        view
        returns (
            address owner,
            string memory ipfsCid,
            DataType dataType,
            string memory encryptedSymmetricKey,
            uint256 timestamp,
            bool isValid,
            address provider
        )
    {
        HealthRecord memory record = healthRecords[recordId];

        return (
            record.owner,
            record.ipfsCid,
            record.dataType,
            record.encryptedSymmetricKey,
            record.timestamp,
            record.isValid,
            record.provider
        );
    }

    function getRecordsByCareProvider(
        address _careProvider
    ) public view returns (approvedRecord[] memory) {
        require(_careProvider != address(0), "Invalid care provider address");

        uint256 totalRecordsForCareProvider = approvedRecords[_careProvider]
            .length;
        approvedRecord[] memory records = new approvedRecord[](
            totalRecordsForCareProvider
        );

        for (uint j = 0; j < approvedRecords[_careProvider].length; j++) {
            approvedRecord memory record = approvedRecords[_careProvider][j];
            records[j] = record;
        }
        return records;
    }

    function getRecordsForResearcher(
        address requester,
        string memory recordId
    ) public view returns (approvedRecord memory) {
        require(requester != address(0), "Invalid address");

        // If the user is a researcher, fetch their records
        approvedRecord memory record = approvedRecordsByID[recordId];

        return record;
    }

    function invalidateRecord(
        string memory _ipfsCid
    ) external recordExists(_ipfsCid) onlySystemOwner {
        healthRecords[_ipfsCid].isValid = false;
    }

    function getPermissionRequest(
        bytes32 requestId
    )
        public
        view
        returns (
            address requester,
            address owner,
            string memory ipfsCid,
            uint256 requestDate,
            uint256 expiryDate,
            uint256 incentiveAmount,
            bool isIncentiveBased,
            uint8 status // Convert `RequestStatus` to uint8 for return
        )
    {
        PermissionRequest storage request = permissionRequests[requestId];
        return (
            request.requester,
            request.owner,
            request.ipfsCid,
            request.requestDate,
            request.expiryDate,
            request.incentiveAmount,
            request.isIncentiveBased,
            uint8(request.status)
        );
    }

    // Emergency Access
    function emergencyAccess(
        address _patientAddress
    ) external onlyProvider returns (bool) {
        require(
            keccak256(abi.encodePacked(users[_patientAddress].role)) ==
                keccak256(abi.encodePacked(Role.PATIENT)),
            "Patient not found"
        );

        emit EmergencyAccess(msg.sender, _patientAddress, block.timestamp);
        return true;
    }
}
