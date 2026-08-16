// SPDX-License-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LXON Team Vesting Contract
 * @dev 4-year vesting with 1-year cliff for team allocation
 * Controlled by DAO governance, not centralized
 * @custom:security-contact security@lxon.network
 */
contract LXONVesting is Ownable, ReentrancyGuard {
    IERC20 public immutable lxonToken;
    
    // Vesting parameters
    uint256 public constant VESTING_DURATION = 4 * 365 days; // 4 years
    uint256 public constant CLIFF_DURATION = 365 days; // 1 year cliff
    uint256 public constant TOTAL_TEAM_ALLOCATION = 200_000_000 * 10**18; // 200M tokens
    
    // Beneficiary tracking
    struct Beneficiary {
        address beneficiary;
        uint256 totalAllocation;
        uint256 startTime;
        uint256 claimedAmount;
        bool isActive;
    }
    
    mapping(address => Beneficiary) public beneficiaries;
    address[] public beneficiaryList;
    
    // DAO control
    address public daoGovernance;
    
    // Events
    event BeneficiaryAdded(address indexed beneficiary, uint256 allocation, uint256 startTime);
    event BeneficiaryRemoved(address indexed beneficiary);
    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event VestingUpdated(address indexed beneficiary, uint256 newAllocation);
    event DAOUpdated(address indexed newDAO);
    event EmergencyWithdraw(address indexed to, uint256 amount);

    /**
     * @dev Initialize vesting contract with token reference
     */
    constructor(IERC20 _lxonToken) Ownable(msg.sender) {
        lxonToken = _lxonToken;
        daoGovernance = msg.sender; // Initially set to deployer, will transfer to DAO
    }

    /**
     * @dev Add beneficiary with vesting schedule
     * Only DAO governance can add beneficiaries after setup
     */
    function addBeneficiary(
        address _beneficiary,
        uint256 _allocation,
        uint256 _startTime
    ) external onlyOwner {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_allocation > 0, "Invalid allocation");
        require(!beneficiaries[_beneficiary].isActive, "Beneficiary already exists");
        
        uint256 totalAllocated = getTotalAllocated();
        require(totalAllocated + _allocation <= TOTAL_TEAM_ALLOCATION, "Exceeds team allocation");
        
        beneficiaries[_beneficiary] = Beneficiary({
            beneficiary: _beneficiary,
            totalAllocation: _allocation,
            startTime: _startTime,
            claimedAmount: 0,
            isActive: true
        });
        
        beneficiaryList.push(_beneficiary);
        
        emit BeneficiaryAdded(_beneficiary, _allocation, _startTime);
    }

    /**
     * @dev Remove beneficiary (DAO can revoke if necessary)
     */
    function removeBeneficiary(address _beneficiary) external onlyOwner {
        require(beneficiaries[_beneficiary].isActive, "Beneficiary not active");
        
        // Refund unclaimed tokens to DAO
        uint256 unclaimed = getVestedAmount(_beneficiary) - beneficiaries[_beneficiary].claimedAmount;
        if (unclaimed > 0) {
            require(lxonToken.transfer(daoGovernance, unclaimed), "Transfer failed");
        }
        
        beneficiaries[_beneficiary].isActive = false;
        
        emit BeneficiaryRemoved(_beneficiary);
    }

    /**
     * @dev Update beneficiary allocation (DAO control)
     */
    function updateBeneficiaryAllocation(
        address _beneficiary,
        uint256 _newAllocation
    ) external onlyOwner {
        require(beneficiaries[_beneficiary].isActive, "Beneficiary not active");
        
        uint256 totalAllocated = getTotalAllocated() - beneficiaries[_beneficiary].totalAllocation;
        require(totalAllocated + _newAllocation <= TOTAL_TEAM_ALLOCATION, "Exceeds team allocation");
        
        beneficiaries[_beneficiary].totalAllocation = _newAllocation;
        
        emit VestingUpdated(_beneficiary, _newAllocation);
    }

    /**
     * @dev Claim vested tokens
     * Beneficiaries can claim their vested tokens
     */
    function claimTokens() external nonReentrant {
        Beneficiary storage beneficiary = beneficiaries[msg.sender];
        require(beneficiary.isActive, "Not a beneficiary");
        
        uint256 vestedAmount = getVestedAmount(msg.sender);
        uint256 claimableAmount = vestedAmount - beneficiary.claimedAmount;
        
        require(claimableAmount > 0, "No tokens to claim");
        require(lxonToken.transfer(msg.sender, claimableAmount), "Transfer failed");
        
        beneficiary.claimedAmount += claimableAmount;
        
        emit TokensClaimed(msg.sender, claimableAmount);
    }

    /**
     * @dev Calculate vested amount for beneficiary
     */
    function getVestedAmount(address _beneficiary) public view returns (uint256) {
        Beneficiary memory beneficiaryInfo = beneficiaries[_beneficiary];
        if (!beneficiaryInfo.isActive) return 0;
        
        uint256 timeElapsed = block.timestamp - beneficiaryInfo.startTime;
        
        // Before cliff - no vesting
        if (timeElapsed < CLIFF_DURATION) {
            return 0;
        }
        
        // After cliff - linear vesting over 4 years
        uint256 vestingTime = timeElapsed - CLIFF_DURATION;
        uint256 vestingProgress = vestingTime >= VESTING_DURATION ? 
            VESTING_DURATION : vestingTime;
        
        uint256 vestedAmount = (beneficiaryInfo.totalAllocation * vestingProgress) / VESTING_DURATION;
        
        return vestedAmount;
    }

    /**
     * @dev Get claimable amount for beneficiary
     */
    function getClaimableAmount(address _beneficiary) external view returns (uint256) {
        uint256 vestedAmount = getVestedAmount(_beneficiary);
        uint256 claimedAmount = beneficiaries[_beneficiary].claimedAmount;
        
        return vestedAmount > claimedAmount ? vestedAmount - claimedAmount : 0;
    }

    /**
     * @dev Get total allocated tokens
     */
    function getTotalAllocated() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < beneficiaryList.length; i++) {
            if (beneficiaries[beneficiaryList[i]].isActive) {
                total += beneficiaries[beneficiaryList[i]].totalAllocation;
            }
        }
        return total;
    }

    /**
     * @dev Get remaining unallocated team tokens
     */
    function getRemainingAllocation() public view returns (uint256) {
        return TOTAL_TEAM_ALLOCATION - getTotalAllocated();
    }

    /**
     * @dev Transfer control to DAO governance
     * This is the key step to decentralize
     */
    function transferControlToDAO(address _daoGovernance) external onlyOwner {
        require(_daoGovernance != address(0), "Invalid DAO address");
        daoGovernance = _daoGovernance;
        
        // Transfer ownership to DAO
        _transferOwnership(_daoGovernance);
        
        emit DAOUpdated(_daoGovernance);
    }

    /**
     * @dev Emergency withdraw (DAO only)
     * For security emergencies, requires DAO approval
     */
    function emergencyWithdraw(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid recipient");
        require(lxonToken.transfer(_to, _amount), "Transfer failed");
        
        emit EmergencyWithdraw(_to, _amount);
    }

    /**
     * @dev Get vesting schedule details
     */
    function getVestingSchedule() external pure returns (
        uint256 vestingDuration,
        uint256 cliffDuration,
        uint256 totalTeamAllocation
    ) {
        return (VESTING_DURATION, CLIFF_DURATION, TOTAL_TEAM_ALLOCATION);
    }

    /**
     * @dev Get beneficiary count
     */
    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaryList.length;
    }

    /**
     * @dev Get all beneficiaries
     */
    function getAllBeneficiaries() external view returns (address[] memory) {
        return beneficiaryList;
    }

    /**
     * @dev Get contract statistics
     */
    function getStatistics() external view returns (
        uint256 totalBeneficiaries,
        uint256 totalAllocated,
        uint256 totalClaimed,
        uint256 unclaimedTokens,
        uint256 remainingAllocation
    ) {
        totalBeneficiaries = beneficiaryList.length;
        totalAllocated = getTotalAllocated();
        
        uint256 claimed = 0;
        for (uint256 i = 0; i < beneficiaryList.length; i++) {
            claimed += beneficiaries[beneficiaryList[i]].claimedAmount;
        }
        totalClaimed = claimed;
        
        unclaimedTokens = totalAllocated - totalClaimed;
        remainingAllocation = getRemainingAllocation();
    }
}