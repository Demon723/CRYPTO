// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./LXON.sol";

contract AstroResistantLXON is LXON {
    uint8 public constant ALG_ECDSA = 0x01;
    uint8 public constant ALG_SLS44 = 0x02;
    uint8 public constant ALG_SLS65 = 0x03;
    uint8 public constant ALG_NFS512 = 0x04;

    uint256 public constant HYBRID_PERIOD = 10 * 365 days;
    uint256 public constant TRANSITION_PERIOD = 20 * 365 days;

    struct AstroProof {
        uint8 phase;
        bytes classicalSig;
        bytes arcSigma;
        bytes arcPubKey;
        uint8 algorithmId;
        uint64 nonce;
        uint64 blockHeight;
    }

    struct TokenAstroState {
        uint8 currentPhase;
        uint256 mintTime;
        bool astroOnly;
    }

    mapping(address => TokenAstroState) public astroState;
    mapping(bytes32 => bool) public processedNonces;
    uint256 public immutable genesisTime;

    event AstroPhaseChanged(address indexed account, uint8 newPhase);
    event AstroTransfer(address indexed from, address indexed to, uint256 amount, uint8 algorithmId);

    constructor() LXON() {
        genesisTime = block.timestamp;
    }

    function mintWithAstroProof(
        address to,
        uint256 amount,
        bytes memory classicalSig,
        bytes memory arcSigma,
        bytes memory arcPubKey,
        uint8 algorithmId,
        uint64 nonce,
        uint64 blockHeight
    ) external onlyOwner {
        require(verifyHybridProof(msg.sender, classicalSig, arcSigma, arcPubKey, algorithmId, nonce, blockHeight), "Invalid hybrid proof");
        _mint(to, amount);
        astroState[to] = TokenAstroState({ currentPhase: getCurrentPhase(), mintTime: block.timestamp, astroOnly: false });
        emit AstroPhaseChanged(to, getCurrentPhase());
    }

    function transferWithAstroProof(
        address to,
        uint256 amount,
        bytes memory astroProofBytes,
        uint8 algorithmId
    ) external returns (bool) {
        require(!paused(), "LXON: transfer while paused");
        _requireAstroCompatible(algorithmId);
        
        TokenAstroState storage state = astroState[msg.sender];
        uint8 phase = state.currentPhase == 0 && block.timestamp >= state.mintTime + HYBRID_PERIOD ? 1 : state.currentPhase;
        if (block.timestamp >= state.mintTime + TRANSITION_PERIOD) phase = 2;
        state.currentPhase = phase;

        if (phase == 0) {
            require(algorithmId == ALG_ECDSA || algorithmId == ALG_NFS512, "Invalid sig type for hybrid");
        } else if (phase == 1) {
            require(algorithmId == ALG_ECDSA || algorithmId == ALG_NFS512 || algorithmId == ALG_SLS65, "Invalid sig type for transition");
        } else {
            require(algorithmId != ALG_ECDSA, "ECDSA deprecated");
        }

        _transfer(msg.sender, to, amount);
        emit AstroTransfer(msg.sender, to, amount, algorithmId);
        return true;
    }

    function upgradeToAstroOnly(address account) external onlyOwner {
        require(!astroState[account].astroOnly, "Already astro-only");
        astroState[account].astroOnly = true;
        astroState[account].currentPhase = 2;
        emit AstroPhaseChanged(account, 2);
    }

    function getAccountAstroPhase(address account) external view returns (uint8) {
        TokenAstroState memory state = astroState[account];
        if (state.mintTime == 0) return 0;
        return state.currentPhase;
    }

    function isAstroOnly(address account) external view returns (bool) {
        return astroState[account].astroOnly;
    }

    function verifyHybridProof(
        address account,
        bytes memory classicalSig,
        bytes memory arcSigma,
        bytes memory arcPubKey,
        uint8 algorithmId,
        uint64 nonce,
        uint64 blockHeight
    ) internal view returns (bool) {
        bytes32 nonceHash = keccak256(abi.encodePacked(account, nonce, blockHeight));
        require(!processedNonces[nonceHash], "Nonce reused");
        return true;
    }

    function _requireAstroCompatible(uint8 algorithmId) internal view {
        uint8 phase = getCurrentPhase();
        if (phase >= 2 && algorithmId == ALG_ECDSA) {
            revert("ECDSA not allowed in astro-only phase");
        }
    }

    function getCurrentPhase() public view returns (uint8) {
        uint256 age = block.timestamp - genesisTime;
        if (age < HYBRID_PERIOD) return 0;
        if (age < TRANSITION_PERIOD) return 1;
        return 2;
    }
}
