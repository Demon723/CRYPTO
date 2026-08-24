// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title LXON Space Heritage Provenance
 * @notice Blockchain-based provenance tracking for space-flown materials and artifacts
 * @dev Immutable cryptographic proof of space heritage for phygital assets
 * 
 * Space Heritage Categories:
 * - Orbital Debris: Recycled satellite material
 * - Lunar Samples: Moon mission artifacts
 * - Martian Material: Mars mission samples
 * - ISS Artifacts: Space station components
 * - Rocket Components: Launch vehicle parts
 * 
 * Provenance Features:
 * - Cryptographic material hashing
 * - Mission flight verification
 * - Chain of custody tracking
 * - Scientific certification
 * - Historical significance scoring
 */
contract LXONSpaceHeritage {
    
    // Space Mission Types
    enum MissionType { APOLLO, SKYLAB, SPACE_SHUTTLE, ISS, COMMERCIAL, LUNAR, MARTIAN, DEEP_SPACE }
    
    // Material Categories
    enum MaterialCategory { ALUMINUM, TITANIUM, STEEL, COPPER, GOLD, SILVER, PLATINUM, COMPOSITE, CERAMIC, TEXTILE }
    
    // Heritage Certification Levels
    enum CertificationLevel { UNVERIFIED, PRELIMINARY, VERIFIED, CERTIFIED, HERITAGE_GRADE }
    
    // Space Heritage Artifact
    struct SpaceArtifact {
        uint256 artifactId;
        string name;
        string description;
        MissionType missionType;
        string missionName;
        uint256 launchDate;
        uint256 returnDate;
        MaterialCategory materialCategory;
        bytes32 materialHash;            // Cryptographic hash of material
        bytes32[] chainOfCustody;        // Previous holders
        CertificationLevel certification;
        uint256 significanceScore;      // Historical importance (0-1000)
        string[] images;                // IPFS hashes of images
        string[] documents;             // IPFS hashes of documentation
        bool isAuthenticated;
        uint256 registrationTimestamp;
    }
    
    // Flight Verification
    struct FlightVerification {
        uint256 artifactId;
        string flightNumber;
        string launchSite;
        uint256 altitude;
        uint256 duration;
        string orbitDetails;
        bytes32 flightDataHash;
        bool verified;
    }
    
    // Scientific Analysis
    struct ScientificAnalysis {
        uint256 artifactId;
        string analysisType;
        string institution;
        bytes32 analysisHash;
        uint256 analysisDate;
        string[] results;
        CertificationLevel certification;
    }
    
    // State
    uint256 public artifactCounter;
    mapping(uint256 => SpaceArtifact) public artifacts;
    mapping(uint256 => FlightVerification) public flightVerifications;
    mapping(uint256 => ScientificAnalysis[]) public scientificAnalyses;
    mapping(bytes32 => uint256) public materialToArtifact;
    mapping(string => uint256[]) public missionToArtifacts;
    
    address public spaceAuthority;
    uint256 public constant MAX_SIGNIFICANCE_SCORE = 1000;
    
    // Events
    event ArtifactRegistered(uint256 indexed artifactId, string name, MissionType missionType);
    event MaterialHashed(uint256 indexed artifactId, bytes32 materialHash);
    event FlightVerified(uint256 indexed artifactId, string flightNumber);
    event ChainOfCustodyUpdated(uint256 indexed artifactId, address newHolder);
    event CertificationUpdated(uint256 indexed artifactId, CertificationLevel level);
    event ScientificAnalysisAdded(uint256 indexed artifactId, string analysisType);
    event SignificanceScored(uint256 indexed artifactId, uint256 score);
    
    // Modifiers
    modifier onlySpaceAuthority() {
        require(msg.sender == spaceAuthority, "Not space authority");
        _;
    }
    
    modifier validArtifact(uint256 artifactId) {
        require(artifacts[artifactId].artifactId != 0, "Invalid artifact");
        _;
    }
    
    constructor(address _spaceAuthority) {
        spaceAuthority = _spaceAuthority;
    }
    
    /**
     * @notice Register a new space heritage artifact
     * @param name Artifact name
     * @param description Detailed description
     * @param missionType Type of space mission
     * @param missionName Name of the specific mission
     * @param launchDate Unix timestamp of launch
     * @param returnDate Unix timestamp of return (0 if still in space)
     * @param materialCategory Type of material
     * @param materialHash Cryptographic hash of the material
     * @param images IPFS hashes of artifact images
     * @param documents IPFS hashes of documentation
     */
    function registerArtifact(
        string memory name,
        string memory description,
        MissionType missionType,
        string memory missionName,
        uint256 launchDate,
        uint256 returnDate,
        MaterialCategory materialCategory,
        bytes32 materialHash,
        string[] memory images,
        string[] memory documents
    ) external onlySpaceAuthority returns (uint256) {
        uint256 artifactId = ++artifactCounter;
        
        artifacts[artifactId] = SpaceArtifact({
            artifactId: artifactId,
            name: name,
            description: description,
            missionType: missionType,
            missionName: missionName,
            launchDate: launchDate,
            returnDate: returnDate,
            materialCategory: materialCategory,
            materialHash: materialHash,
            chainOfCustody: new bytes32[](0),
            certification: CertificationLevel.UNVERIFIED,
            significanceScore: 0,
            images: images,
            documents: documents,
            isAuthenticated: false,
            registrationTimestamp: block.timestamp
        });
        
        if (materialHash != bytes32(0)) {
            materialToArtifact[materialHash] = artifactId;
        }
        
        missionToArtifacts[missionName].push(artifactId);
        
        emit ArtifactRegistered(artifactId, name, missionType);
        if (materialHash != bytes32(0)) {
            emit MaterialHashed(artifactId, materialHash);
        }
        
        return artifactId;
    }
    
    /**
     * @notice Verify flight data for an artifact
     * @param artifactId Artifact identifier
     * @param flightNumber Flight designation
     * @param launchSite Launch location
     * @param altitude Maximum altitude reached (meters)
     * @param duration Mission duration (seconds)
     * @param orbitDetails Orbital parameters
     * @param flightDataHash Hash of flight telemetry data
     */
    function verifyFlight(
        uint256 artifactId,
        string memory flightNumber,
        string memory launchSite,
        uint256 altitude,
        uint256 duration,
        string memory orbitDetails,
        bytes32 flightDataHash
    ) external onlySpaceAuthority validArtifact(artifactId) {
        flightVerifications[artifactId] = FlightVerification({
            artifactId: artifactId,
            flightNumber: flightNumber,
            launchSite: launchSite,
            altitude: altitude,
            duration: duration,
            orbitDetails: orbitDetails,
            flightDataHash: flightDataHash,
            verified: true
        });
        
        artifacts[artifactId].isAuthenticated = true;
        artifacts[artifactId].certification = CertificationLevel.VERIFIED;
        
        emit FlightVerified(artifactId, flightNumber);
        emit CertificationUpdated(artifactId, CertificationLevel.VERIFIED);
    }
    
    /**
     * @notice Add scientific analysis
     * @param artifactId Artifact identifier
     * @param analysisType Type of analysis performed
     * @param institution Scientific institution
     * @param analysisHash Hash of analysis data
     * @param results Analysis results
     */
    function addScientificAnalysis(
        uint256 artifactId,
        string memory analysisType,
        string memory institution,
        bytes32 analysisHash,
        string[] memory results
    ) external onlySpaceAuthority validArtifact(artifactId) {
        scientificAnalyses[artifactId].push(ScientificAnalysis({
            artifactId: artifactId,
            analysisType: analysisType,
            institution: institution,
            analysisHash: analysisHash,
            analysisDate: block.timestamp,
            results: results,
            certification: CertificationLevel.PRELIMINARY
        }));
        
        emit ScientificAnalysisAdded(artifactId, analysisType);
    }
    
    /**
     * @notice Update chain of custody
     * @param artifactId Artifact identifier
     * @param newHolder New holder address
     * @param transferSignature Signature from current holder
     */
    function updateChainOfCustody(
        uint256 artifactId,
        address newHolder,
        bytes memory transferSignature
    ) external validArtifact(artifactId) {
        require(newHolder != address(0), "Invalid holder");
        
        // Verify transfer signature (simplified)
        bytes32 hash = keccak256(abi.encodePacked(
            "TRANSFER_CUSTODY",
            artifactId,
            newHolder,
            block.timestamp
        ));
        
        // In production, verify signature properly
        artifacts[artifactId].chainOfCustody.push(hash);
        
        emit ChainOfCustodyUpdated(artifactId, newHolder);
    }
    
    /**
     * @notice Set certification level
     * @param artifactId Artifact identifier
     * @param level New certification level
     */
    function setCertification(uint256 artifactId, CertificationLevel level) external onlySpaceAuthority validArtifact(artifactId) {
        artifacts[artifactId].certification = level;
        
        if (level == CertificationLevel.HERITAGE_GRADE) {
            artifacts[artifactId].significanceScore = MAX_SIGNIFICANCE_SCORE;
        }
        
        emit CertificationUpdated(artifactId, level);
    }
    
    /**
     * @notice Score historical significance
     * @param artifactId Artifact identifier
     * @param score Significance score (0-1000)
     */
    function scoreSignificance(uint256 artifactId, uint256 score) external onlySpaceAuthority validArtifact(artifactId) {
        require(score <= MAX_SIGNIFICANCE_SCORE, "Score too high");
        
        artifacts[artifactId].significanceScore = score;
        
        emit SignificanceScored(artifactId, score);
    }
    
    /**
     * @notice Get artifact information
     */
    function getArtifact(uint256 artifactId) external view returns (SpaceArtifact memory) {
        return artifacts[artifactId];
    }
    
    /**
     * @notice Get flight verification
     */
    function getFlightVerification(uint256 artifactId) external view returns (FlightVerification memory) {
        return flightVerifications[artifactId];
    }
    
    /**
     * @notice Get scientific analyses
     */
    function getScientificAnalyses(uint256 artifactId) external view returns (ScientificAnalysis[] memory) {
        return scientificAnalyses[artifactId];
    }
    
    /**
     * @notice Get artifacts by mission
     */
    function getArtifactsByMission(string memory missionName) external view returns (uint256[] memory) {
        return missionToArtifacts[missionName];
    }
    
    /**
     * @notice Find artifact by material hash
     */
    function findArtifactByMaterial(bytes32 materialHash) external view returns (uint256) {
        return materialToArtifact[materialHash];
    }
    
    /**
     * @notice Get heritage grade artifacts
     */
    function getHeritageGradeArtifacts() external view returns (uint256[] memory) {
        uint256[] memory heritageArtifacts = new uint256[](artifactCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= artifactCounter; i++) {
            if (artifacts[i].certification == CertificationLevel.HERITAGE_GRADE) {
                heritageArtifacts[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = heritageArtifacts[i];
        }
        
        return result;
    }
    
    /**
     * @notice Calculate heritage value based on significance
     * @param artifactId Artifact identifier
     */
    function calculateHeritageValue(uint256 artifactId) external view validArtifact(artifactId) returns (uint256) {
        SpaceArtifact memory artifact = artifacts[artifactId];
        
        uint256 baseValue = artifact.significanceScore * 10**18; // Base in XON
        
        // Multipliers
        uint256 certificationMultiplier;
        if (artifact.certification == CertificationLevel.HERITAGE_GRADE) {
            certificationMultiplier = 1000;
        } else if (artifact.certification == CertificationLevel.CERTIFIED) {
            certificationMultiplier = 500;
        } else if (artifact.certification == CertificationLevel.VERIFIED) {
            certificationMultiplier = 100;
        } else {
            certificationMultiplier = 10;
        }
        
        // Mission type multiplier
        uint256 missionMultiplier;
        if (artifact.missionType == MissionType.APOLLO) {
            missionMultiplier = 500; // Apollo missions are most valuable
        } else if (artifact.missionType == MissionType.LUNAR) {
            missionMultiplier = 300;
        } else if (artifact.missionType == MissionType.ISS) {
            missionMultiplier = 200;
        } else {
            missionMultiplier = 100;
        }
        
        // Age multiplier (older = more valuable)
        uint256 ageYears = (block.timestamp - artifact.launchDate) / (365 days);
        uint256 ageMultiplier = 1 + (ageYears / 10); // 10% increase per decade
        
        return (baseValue * certificationMultiplier * missionMultiplier * ageMultiplier) / (10**18 * 100 * 100);
    }
    
    // Space Authority Functions
    function setSpaceAuthority(address newAuthority) external onlySpaceAuthority {
        spaceAuthority = newAuthority;
    }
}