// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXONNativeToken.sol";

/**
 * @title LXON Stellar Evolution Tokenomics
 * @notice Cosmic-inspired emission model based on stellar evolution phases
 * @dev Tokenomics that mirror stellar lifecycle: birth, stability, expansion, supernova
 * 
 * Stellar Evolution Model:
 * - Protostar Phase: Rapid emission, high energy
 * - Main Sequence: Stable emission, long duration
 * - Red Giant: Expanding emission, declining energy
 * - Supernova: Final burst, then transition to white dwarf
 * 
 * Mathematical Model:
 * - Emission follows stellar luminosity curves
 * - Power based on stellar mass and evolutionary stage
 * - Governance weight proportional to stellar significance
 */
contract LXONStellarTokenomics {
    LXONNativeToken public immutable lxonToken;
    
    // Stellar Phases
    enum StellarPhase { PROTOSTAR, MAIN_SEQUENCE, RED_GIANT, SUPERNOVA, WHITE_DWARF }
    
    // Stellar Classifications
    enum StellarClass { O_TYPE, B_TYPE, A_TYPE, F_TYPE, G_TYPE, K_TYPE, M_TYPE }
    
    // Stellar Configuration
    struct StellarSystem {
        uint256 systemId;
        string name;
        StellarPhase currentPhase;
        StellarClass stellarClass;
        uint256 stellarMass;           // Solar masses
        uint256 luminosity;            // Solar luminosities
        uint256 age;                   // Million years
        uint256 emissionRate;          // XON per block
        uint256 governancePower;
        uint256 phaseTransitionTime;
    }
    
    // Phase Configurations
    struct PhaseConfig {
        uint256 duration;              // In years
        uint256 baseEmission;          // Base XON emission
        uint256 emissionMultiplier;    // Multiplier based on phase
        uint256 governanceWeight;      // Voting power multiplier
        uint256 burnRate;              // XON burn rate
    }
    
    // Stellar Token Holdings
    struct StellarStakeInfo {
        uint256 systemId;
        uint256 stakedAmount;
        uint256 stellarAge;            // Time since staking
        uint256 accumulatedRewards;
        uint256 lastClaimTime;
        uint256 evolutionProgress;     // 0-100 scale
    }
    
    // State
    uint256 public currentStellarYear;
    StellarPhase public currentPhase;
    uint256 public systemCounter;
    
    mapping(uint256 => StellarSystem) public stellarSystems;
    mapping(uint256 => PhaseConfig) public phaseConfigs;
    mapping(address => StellarStakeInfo) public stellarStakes;
    mapping(uint256 => uint256) public systemToStakers;
    
    // Total Metrics
    uint256 public totalStellarStaked;
    uint256 public totalGovernancePower;
    uint256 public totalEvolutionProgress;
    
    // Constants
    uint256 public constant SOLAR_YEAR = 365 days;
    uint256 public constant STELLAR_YEAR_MULTIPLIER = 1; // 1 block = 1 stellar year
    uint256 public constant MAX_STELLAR_SYSTEMS = 10000;
    
    // Events
    event StellarSystemCreated(uint256 indexed systemId, string name, StellarClass stellarClass);
    event PhaseTransition(StellarPhase oldPhase, StellarPhase newPhase, uint256 timestamp);
    event StellarStake(address indexed staker, uint256 systemId, uint256 amount);
    event StellarEvolution(address indexed staker, uint256 progress);
    event SupernovaEvent(uint256 indexed systemId, uint256 energyReleased);
    event WhiteDwarfFormation(uint256 indexed systemId, uint256 finalMass);
    
    // Modifiers
    modifier validSystem(uint256 systemId) {
        require(stellarSystems[systemId].systemId != 0, "Invalid system");
        _;
    }
    
    modifier onlyValidPhase(StellarPhase phase) {
        require(currentPhase == phase, "Invalid phase");
        _;
    }
    
    constructor(address _lxonToken) {
        lxonToken = LXONNativeToken(_lxonToken);
        currentPhase = StellarPhase.PROTOSTAR;
        currentStellarYear = 0;
        
        _initializePhaseConfigs();
    }
    
    function _initializePhaseConfigs() internal {
        // Protostar Phase (0-100 million years)
        phaseConfigs[uint256(StellarPhase.PROTOSTAR)] = PhaseConfig({
            duration: 100 * 10**6,      // 100 million years
            baseEmission: 1000 * 10**18, // 1000 XON base
            emissionMultiplier: 500,    // 500x multiplier (high energy)
            governanceWeight: 10,       // 10x governance power
            burnRate: 0                 // No burn in formation
        });
        
        // Main Sequence (100 million - 10 billion years)
        phaseConfigs[uint256(StellarPhase.MAIN_SEQUENCE)] = PhaseConfig({
            duration: 10 * 10**9,      // 10 billion years
            baseEmission: 500 * 10**18,  // 500 XON base
            emissionMultiplier: 100,    // 100x multiplier (stable)
            governanceWeight: 5,        // 5x governance power
            burnRate: 1                 // Minimal burn
        });
        
        // Red Giant (10 billion - 12 billion years)
        phaseConfigs[uint256(StellarPhase.RED_GIANT)] = PhaseConfig({
            duration: 2 * 10**9,       // 2 billion years
            baseEmission: 750 * 10**18,  // 750 XON base
            emissionMultiplier: 200,    // 200x multiplier (expanding)
            governanceWeight: 3,        // 3x governance power
            burnRate: 5                 // Increased burn
        });
        
        // Supernova (12 billion - 12.1 billion years)
        phaseConfigs[uint256(StellarPhase.SUPERNOVA)] = PhaseConfig({
            duration: 100 * 10**6,      // 100 million years
            baseEmission: 2000 * 10**18, // 2000 XON base
            emissionMultiplier: 1000,   // 1000x multiplier (explosive)
            governanceWeight: 15,       // 15x governance power
            burnRate: 50                // Massive burn
        });
        
        // White Dwarf (12.1 billion+ years)
        phaseConfigs[uint256(StellarPhase.WHITE_DWARF)] = PhaseConfig({
            duration: type(uint256).max, // Infinite
            baseEmission: 100 * 10**18,  // 100 XON base
            emissionMultiplier: 10,     // 10x multiplier (remnant)
            governanceWeight: 2,        // 2x governance power
            burnRate: 20                // Steady burn
        });
    }
    
    /**
     * @notice Create a new stellar system
     * @param name System name
     * @param stellarClass Stellar classification (O,B,A,F,G,K,M)
     * @param stellarMass Initial mass in solar masses
     */
    function createStellarSystem(
        string memory name,
        StellarClass stellarClass,
        uint256 stellarMass
    ) external returns (uint256) {
        require(systemCounter < MAX_STELLAR_SYSTEMS, "Max systems reached");
        require(stellarMass >= 1 && stellarMass <= 100, "Invalid mass");
        
        uint256 systemId = ++systemCounter;
        
        // Calculate initial properties based on stellar class and mass
        uint256 luminosity = _calculateLuminosity(stellarClass, stellarMass);
        uint256 governancePower = _calculateGovernancePower(stellarClass, stellarMass);
        
        stellarSystems[systemId] = StellarSystem({
            systemId: systemId,
            name: name,
            currentPhase: StellarPhase.PROTOSTAR,
            stellarClass: stellarClass,
            stellarMass: stellarMass,
            luminosity: luminosity,
            age: 0,
            emissionRate: _calculateEmissionRate(StellarPhase.PROTOSTAR, luminosity),
            governancePower: governancePower,
            phaseTransitionTime: block.timestamp
        });
        
        totalGovernancePower += governancePower;
        
        emit StellarSystemCreated(systemId, name, stellarClass);
        
        return systemId;
    }
    
    /**
     * @notice Stake XON to a stellar system
     * @param systemId System identifier
     * @param amount Amount to stake
     */
    function stakeToStellar(uint256 systemId, uint256 amount) external validSystem(systemId) {
        require(amount > 0, "Amount must be > 0");
        
        // Transfer XON from staker
        require(lxonToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update stake
        StellarStakeInfo storage stake = stellarStakes[msg.sender];
        
        if (stake.systemId == 0) {
            // New stake
            stake.systemId = systemId;
            stake.stakedAmount = amount;
            stake.stellarAge = 0;
            stake.accumulatedRewards = 0;
            stake.lastClaimTime = block.timestamp;
            stake.evolutionProgress = 0;
            
            systemToStakers[systemId]++;
        } else {
            // Existing stake
            require(stake.systemId == systemId, "Different system");
            stake.stakedAmount += amount;
        }
        
        totalStellarStaked += amount;
        
        emit StellarStake(msg.sender, systemId, amount);
    }
    
    /**
     * @notice Calculate staking rewards based on stellar evolution
     * @param staker Address to calculate rewards for
     */
    function calculateStellarRewards(address staker) public view returns (uint256) {
        StellarStakeInfo memory stake = stellarStakes[staker];
        if (stake.systemId == 0) return 0;
        
        StellarSystem memory system = stellarSystems[stake.systemId];
        PhaseConfig memory config = phaseConfigs[uint256(system.currentPhase)];
        
        uint256 timeElapsed = block.timestamp - stake.lastClaimTime;
        uint256 stellarYearsElapsed = timeElapsed / STELLAR_YEAR_MULTIPLIER;
        
        // Calculate rewards based on:
        // 1. Stellar luminosity (brightness)
        // 2. Phase emission multiplier
        // 3. Evolution progress
        // 4. Governance power
        
        uint256 baseReward = (stake.stakedAmount * config.baseEmission) / 10**18;
        uint256 phaseBonus = (baseReward * config.emissionMultiplier) / 100;
        uint256 luminosityBonus = (phaseBonus * system.luminosity) / 1000;
        uint256 evolutionBonus = (luminosityBonus * stake.evolutionProgress) / 100;
        uint256 timeBonus = (evolutionBonus * stellarYearsElapsed) / 365;
        
        return timeBonus;
    }
    
    /**
     * @notice Claim stellar staking rewards
     */
    function claimStellarRewards() external {
        StellarStakeInfo storage stake = stellarStakes[msg.sender];
        require(stake.systemId != 0, "No stake");
        
        uint256 rewards = calculateStellarRewards(msg.sender);
        require(rewards > 0, "No rewards");
        
        // Update stake
        stake.accumulatedRewards += rewards;
        stake.lastClaimTime = block.timestamp;
        
        // Mint rewards to staker
        lxonToken.mint(msg.sender, rewards);
    }
    
    /**
     * @notice Advance stellar evolution
     * @param systemId System to evolve
     */
    function advanceStellarEvolution(uint256 systemId) external validSystem(systemId) {
        StellarSystem storage system = stellarSystems[systemId];
        
        PhaseConfig memory currentConfig = phaseConfigs[uint256(system.currentPhase)];
        uint256 timeInPhase = (block.timestamp - system.phaseTransitionTime) / SOLAR_YEAR;
        
        require(timeInPhase >= currentConfig.duration / 10**6, "Phase not complete");
        
        StellarPhase newPhase = _getNextPhase(system.currentPhase);
        
        // Update system
        StellarPhase oldPhase = system.currentPhase;
        system.currentPhase = newPhase;
        system.phaseTransitionTime = block.timestamp;
        system.emissionRate = _calculateEmissionRate(newPhase, system.luminosity);
        
        // Special handling for supernova
        if (newPhase == StellarPhase.SUPERNOVA) {
            emit SupernovaEvent(systemId, system.stellarMass * 1000);
        }
        
        // Special handling for white dwarf formation
        if (newPhase == StellarPhase.WHITE_DWARF) {
            system.stellarMass = system.stellarMass / 2; // Mass loss
            emit WhiteDwarfFormation(systemId, system.stellarMass);
        }
        
        emit PhaseTransition(oldPhase, newPhase, block.timestamp);
    }
    
    /**
     * @notice Evolve user's stake progress
     * @param progress Evolution progress (0-100)
     */
    function evolveStake(uint256 progress) external {
        StellarStakeInfo storage stake = stellarStakes[msg.sender];
        require(stake.systemId != 0, "No stake");
        require(progress <= 100, "Invalid progress");
        require(progress > stake.evolutionProgress, "Cannot devolve");
        
        stake.evolutionProgress = progress;
        
        emit StellarEvolution(msg.sender, progress);
    }
    
    /**
     * @notice Calculate governance power
     * @param staker Address to calculate power for
     */
    function getGovernancePower(address staker) external view returns (uint256) {
        StellarStakeInfo memory stake = stellarStakes[staker];
        if (stake.systemId == 0) return 0;
        
        StellarSystem memory system = stellarSystems[stake.systemId];
        PhaseConfig memory config = phaseConfigs[uint256(system.currentPhase)];
        
        uint256 basePower = (stake.stakedAmount * config.governanceWeight) / 10**18;
        uint256 evolutionBonus = (basePower * stake.evolutionProgress) / 100;
        uint256 stellarBonus = (evolutionBonus * system.governancePower) / 100;
        
        return stellarBonus;
    }
    
    /**
     * @notice Calculate luminosity based on stellar class and mass
     */
    function _calculateLuminosity(StellarClass stellarClass, uint256 mass) internal pure returns (uint256) {
        // Simplified stellar mass-luminosity relationship: L ∝ M^3.5
        uint256 massLuminosity = mass ** 35 / 10**34; // mass^3.5 approximation
        
        // Class multiplier
        uint256 classMultiplier;
        if (stellarClass == StellarClass.O_TYPE) classMultiplier = 1000;
        else if (stellarClass == StellarClass.B_TYPE) classMultiplier = 500;
        else if (stellarClass == StellarClass.A_TYPE) classMultiplier = 200;
        else if (stellarClass == StellarClass.F_TYPE) classMultiplier = 100;
        else if (stellarClass == StellarClass.G_TYPE) classMultiplier = 50;
        else if (stellarClass == StellarClass.K_TYPE) classMultiplier = 20;
        else classMultiplier = 10; // M_TYPE
        
        return (massLuminosity * classMultiplier) / 100;
    }
    
    /**
     * @notice Calculate governance power based on stellar properties
     */
    function _calculateGovernancePower(StellarClass stellarClass, uint256 mass) internal pure returns (uint256) {
        uint256 basePower = mass * 10; // Base power from mass
        uint256 classPower;
        
        if (stellarClass == StellarClass.O_TYPE) classPower = 1000;
        else if (stellarClass == StellarClass.B_TYPE) classPower = 500;
        else if (stellarClass == StellarClass.A_TYPE) classPower = 200;
        else if (stellarClass == StellarClass.F_TYPE) classPower = 100;
        else if (stellarClass == StellarClass.G_TYPE) classPower = 50;
        else if (stellarClass == StellarClass.K_TYPE) classPower = 20;
        else classPower = 10;
        
        return basePower + classPower;
    }
    
    /**
     * @notice Calculate emission rate based on phase and luminosity
     */
    function _calculateEmissionRate(StellarPhase phase, uint256 luminosity) internal view returns (uint256) {
        PhaseConfig memory config = phaseConfigs[uint256(phase)];
        return (config.baseEmission * config.emissionMultiplier * luminosity) / (10**18 * 1000);
    }
    
    /**
     * @notice Get next stellar phase
     */
    function _getNextPhase(StellarPhase current) internal pure returns (StellarPhase) {
        if (current == StellarPhase.PROTOSTAR) return StellarPhase.MAIN_SEQUENCE;
        if (current == StellarPhase.MAIN_SEQUENCE) return StellarPhase.RED_GIANT;
        if (current == StellarPhase.RED_GIANT) return StellarPhase.SUPERNOVA;
        if (current == StellarPhase.SUPERNOVA) return StellarPhase.WHITE_DWARF;
        return StellarPhase.WHITE_DWARF; // Final state
    }
    
    /**
     * @notice Get stellar system information
     */
    function getStellarSystem(uint256 systemId) external view returns (StellarSystem memory) {
        return stellarSystems[systemId];
    }
    
    /**
     * @notice Get phase configuration
     */
    function getPhaseConfig(StellarPhase phase) external view returns (PhaseConfig memory) {
        return phaseConfigs[uint256(phase)];
    }
    
    /**
     * @notice Get current stellar year
     */
    function getCurrentStellarYear() external view returns (uint256) {
        return block.timestamp / STELLAR_YEAR_MULTIPLIER;
    }
}