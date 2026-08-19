// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title wLXON - Wrapped LXON Token on Ethereum
 * @notice ERC20 representation of native LXON on the LXON chain
 * @dev Minted/burned by the bridge contract only
 */
contract wLXON is ERC20, Ownable {
    address public immutable bridge;
    address public immutable lxonChainToken;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(
        address _bridge,
        address _lxonChainToken,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {
        bridge = _bridge;
        lxonChainToken = _lxonChainToken;
    }

    /**
     * @dev Mint wLXON when user locks native LXON on LXON chain
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit Deposited(to, amount);
    }

    /**
     * @dev Burn wLXON when user unlocks native LXON on LXON chain
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Batch mint for bridge operations
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Array length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Get token info
     */
    function tokenInfo() external pure returns (string memory, uint8) {
        return ("LXON", 18);
    }
}
