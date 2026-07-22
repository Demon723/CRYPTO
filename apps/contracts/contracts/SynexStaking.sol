// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ILXON {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract SynexStaking is AccessControl, ReentrancyGuard {
    ILXON public immutable lxonToken;

    uint256 public constant APY_BASE = 12;
    uint256 public constant LOCK_PERIOD = 30 days;
    uint256 public constant MIN_STAKE = 100 * 10**18;
    uint256 public constant CLIP_DECAY_RATE = 5; // 5% emission penalty per epoch for net outflow subnets
    uint256 public constant DECOMMISSION_THRESHOLD = 0; // net stake == 0 => decommission

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    struct StakingPosition {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 apy;
        bool active;
        bool unstakeRequested;
        bytes32 subnetId;
    }

    struct SubnetState {
        uint256 totalStaked;
        uint256 lastEpochNetFlow; // positive = inflow, negative = outflow
        uint256 emissionWeight;
        bool active;
        uint256 lastEpochBlock;
    }

    mapping(address => StakingPosition[]) public userPositions;
    mapping(address => uint256) public totalStaked;
    mapping(bytes32 => SubnetState) public subnets;
    mapping(bytes32 => mapping(address => uint256)) public subnetStakeOf;

    event Staked(address indexed user, uint256 amount, uint256 positionId, bytes32 subnetId);
    event UnstakeRequested(address indexed user, uint256 positionId);
    event Unstaked(address indexed user, uint256 amount, uint256 positionId);
    event RewardPaid(address indexed user, uint256 amount);
    event SubnetCreated(bytes32 indexed subnetId, address indexed operator);
    event SubnetDecommissioned(bytes32 indexed subnetId);
    event EpochProcessed(uint256 indexed epoch, bytes32 indexed subnetId, uint256 netFlow, uint256 newWeight);

    constructor(address _lxonToken) {
        require(_lxonToken != address(0), "Invalid token address");
        lxonToken = ILXON(_lxonToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    function stake(uint256 amount, bytes32 subnetId) external nonReentrant returns (uint256) {
        require(amount >= MIN_STAKE, "Below minimum stake");
        require(lxonToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(subnets[subnetId].active || subnets[subnetId].totalStaked == 0, "Subnet inactive");

        if (subnets[subnetId].totalStaked == 0) {
            subnets[subnetId].active = true;
            emit SubnetCreated(subnetId, msg.sender);
        }

        lxonToken.transferFrom(msg.sender, address(this), amount);

        uint256 positionId = userPositions[msg.sender].length;
        userPositions[msg.sender].push(StakingPosition({
            amount: amount,
            startTime: block.timestamp,
            endTime: block.timestamp + LOCK_PERIOD,
            apy: APY_BASE,
            active: true,
            unstakeRequested: false,
            subnetId: subnetId,
        }));

        userPositions[msg.sender].length;
        totalStaked[msg.sender] += amount;
        subnetStakeOf[subnetId][msg.sender] += amount;
        subnets[subnetId].totalStaked += amount;

        emit Staked(msg.sender, amount, positionId, subnetId);
        return positionId;
    }

    function requestUnstake(uint256 positionId) external nonReentrant {
        require(positionId < userPositions[msg.sender].length, "Invalid position");
        StakingPosition storage position = userPositions[msg.sender][positionId];
        require(position.active, "Position not active");
        require(!position.unstakeRequested, "Unstake already requested");
        require(block.timestamp >= position.endTime, "Lock period not ended");

        position.unstakeRequested = true;
        emit UnstakeRequested(msg.sender, positionId);
    }

    function unstake(uint256 positionId) external nonReentrant {
        require(positionId < userPositions[msg.sender].length, "Invalid position");
        StakingPosition storage position = userPositions[msg.sender][positionId];
        require(position.active, "Position not active");
        require(position.unstakeRequested, "Unstake not requested");

        uint256 amount = position.amount;
        bytes32 subnetId = position.subnetId;

        position.active = false;
        totalStaked[msg.sender] -= amount;
        subnetStakeOf[subnetId][msg.sender] -= amount;
        subnets[subnetId].totalStaked -= amount;
        subnets[subnetId].lastEpochNetFlow -= amount; // unstake = outflow

        lxonToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount, positionId);
    }

    function claimRewards(uint256 positionId) external nonReentrant {
        require(positionId < userPositions[msg.sender].length, "Invalid position");
        StakingPosition storage position = userPositions[msg.sender][positionId];
        require(position.active, "Position not active");

        uint256 reward = calculateReward(position);
        require(reward > 0, "No rewards to claim");

        lxonToken.transfer(msg.sender, reward);
        emit RewardPaid(msg.sender, reward);
    }

    function calculateReward(StakingPosition memory position) public view returns (uint256) {
        if (!position.active) return 0;
        uint256 stakingDays = (block.timestamp - position.startTime) / 1 days;
        if (stakingDays == 0) return 0;
        return (position.amount * position.apy * stakingDays) / (100 * 365);
    }

    // Taoflow-style emission weight: weighted by net staking flow over epoch
    function computeSubnetWeight(bytes32 subnetId) public view returns (uint256) {
        SubnetState memory s = subnets[subnetId];
        if (!s.active || s.totalStaked == 0) return 0;

        uint256 weight = s.totalStaked;
        if (s.lastEpochNetFlow == 0) {
            // Zero net stake => decommission
            return 0;
        } else if (s.lastEpochNetFlow > 0) {
            // Inflow bonus: weight increases with net inflow
            weight = weight + (weight * s.lastEpochNetFlow) / s.totalStaked;
        } else {
            // Outflow penalty: clip weight (Taoflow-style)
            uint256 penalty = weight * CLIP_DECAY_RATE * uint256(-int256(s.lastEpochNetFlow)) / s.totalStaked;
            weight = weight > penalty ? weight - penalty : 0;
        }
        return weight;
    }

    // Process epoch: reset net flows, decommission zero-stake subnets
    function processEpoch(uint256 epoch) external onlyRole(OPERATOR_ROLE) {
        bytes32[] memory subnetIds = getActiveSubnetIds();
        for (uint256 i = 0; i < subnetIds.length; i++) {
            bytes32 sid = subnetIds[i];
            SubnetState storage s = subnets[sid];

            if (s.totalStaked == 0) {
                s.active = false;
                emit SubnetDecommissioned(sid);
                continue;
            }

            s.emissionWeight = computeSubnetWeight(sid);
            s.lastEpochNetFlow = 0; // reset for next epoch
            s.lastEpochBlock = block.number;

            emit EpochProcessed(epoch, sid, s.lastEpochNetFlow, s.emissionWeight);
        }
    }

    function getActiveSubnetIds() public view returns (bytes32[] memory) {
        // In production, track active subnet IDs in a separate array for O(1) enumeration
        // This is a placeholder that requires off-chain indexing or an explicit registry
        bytes32[] memory empty;
        return empty;
    }

    function getUserPositions(address user) external view returns (StakingPosition[] memory) {
        return userPositions[user];
    }

    function getPendingRewards(address user, uint256 positionId) external view returns (uint256) {
        require(positionId < userPositions[user].length, "Invalid position");
        return calculateReward(userPositions[user][positionId]);
    }

    function getSubnetState(bytes32 subnetId) external view returns (SubnetState memory) {
        return subnets[subnetId];
    }
}
