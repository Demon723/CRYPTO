// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LXON-AMM (Automated Market Maker)
 * @dev Native DEX for LXON blockchain
 * Uniswap-style AMM with x*y=k formula
 * Optimized for high-frequency trading on LXON's 50,000+ TPS chain
 * @custom:security-contact security@lxon.network
 */
contract LXONAMM is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Pair information
    struct Pair {
        address token0;
        address token1;
        uint112 reserve0;
        uint112 reserve1;
        uint32 blockTimestampLast;
    }

    // Swap information
    struct Swap {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOut;
        address to;
    }

    mapping(address => mapping(address => Pair)) public pairs;
    address[] public allPairs;

    uint256 public constant MINIMUM_LIQUIDITY = 1000 * 10**18;
    uint256 public constant FEE_RATE = 30; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 10000;

    address public immutable feeTo;
    address public immutable lxonToken;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256);
    event Swap(address indexed sender, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    event Mint(address indexed sender, address indexed pair, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, address indexed pair, uint256 amount0, uint256 amount1);
    event Sync(address indexed pair, uint112 reserve0, uint112 reserve1);

    modifier validPair(address tokenA, address tokenB) {
        require(tokenA != tokenB, "LXONAMM: IDENTICAL_ADDRESSES");
        address pair = pairs[tokenA][tokenB].token0 == tokenA ? pairs[tokenA][tokenB] : pairs[tokenB][tokenA];
        require(pair != address(0), "LXONAMM: PAIR_NOT_EXISTS");
        _;
    }

    constructor(address _feeTo, address _lxonToken) Ownable(msg.sender) {
        feeTo = _feeTo;
        lxonToken = _lxonToken;
    }

    /**
     * @dev Create a new trading pair
     */
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "LXONAMM: IDENTICAL_ADDRESSES");
        require(pairs[tokenA][tokenB].token0 == address(0), "LXONAMM: PAIR_EXISTS");

        address token0 = tokenA < tokenB ? tokenA : tokenB;
        address token1 = tokenB < tokenA ? tokenB : tokenA;

        pairs[tokenA][tokenB] = pairs[tokenB][tokenA] = Pair({
            token0: token0,
            token1: token1,
            reserve0: 0,
            reserve1: 0,
            blockTimestampLast: 0
        });

        allPairs.push(tokenA);
        allPairs.push(tokenB);

        pair = address(uint160(uint256(keccak256(abi.encodePacked(token0, token1)))));
        emit PairCreated(token0, token1, pair, block.timestamp);
    }

    /**
     * @dev Add liquidity to a pair
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        Pair storage pairInfo = pairs[tokenA][tokenB];
        require(pairInfo.token0 != address(0), "LXONAMM: PAIR_NOT_EXISTS");

        address token0 = pairInfo.token0;
        address token1 = pairInfo.token1;

        uint256 amount0 = tokenA == token0 ? amountADesired : amountBDesired;
        uint256 amount1 = tokenA == token0 ? amountBDesired : amountADesired;

        if (pairInfo.reserve0 == 0 && pairInfo.reserve1 == 0) {
            require(amountA >= MINIMUM_LIQUIDITY && amountB >= MINIMUM_LIQUIDITY, "LXONAMM: INSUFFICIENT_LIQUIDITY");
        }

        (uint256 reserve0, uint256 reserve1) = _getReserves(address(this, token0), address(this, token1));
        if (reserve0 > 0) {
            uint256 amountBOptimal = _quote(amountA, reserve0, reserve1);
            if (amountBDesired > amountBOptimal) {
                uint256 amountAOptimal = _quote(amountBDesired, reserve1, reserve0);
                require(amountA >= amountAOptimal, "LXONAMM: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            } else {
                require(amountB >= amountBMin, "LXONAMM: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            }
        } else {
            require(amountA >= amountAMin, "LXONAMM: INSUFFICIENT_A_AMOUNT");
            require(amountB >= amountBMin, "LXONAMM: INSUFFICIENT_B_AMOUNT");
        }

        SafeERC20.safeTransferFrom(tokenA, msg.sender, address(this), amountA);
        SafeERC20.safeTransferFrom(tokenB, msg.sender, address(this), amountB);

        _mint(to, amountA, amountB);
        pairInfo.reserve0 += uint112(amountA);
        pairInfo.reserve1 += uint112(amountB);
        pairInfo.blockTimestampLast = uint32(block.timestamp);

        emit Sync(address(this), pairInfo.reserve0, pairInfo.reserve1);
        emit Mint(msg.sender, address(this), amountA, amountB);
    }

    /**
     * @dev Remove liquidity from a pair
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        Pair storage pairInfo = pairs[tokenA][tokenB];
        require(pairInfo.token0 != address(0), "LXONAMM: PAIR_NOT_EXISTS");

        address token0 = pairInfo.token0;
        address token1 = pairInfo.token1;

        (uint256 reserve0, uint256 reserve1) = _getReserves(address(this), address(this), token0, token1);
        uint256 totalSupply = IERC20(_getLPToken(token0, token1)).totalSupply();

        uint256 amount0 = (liquidity * reserve0) / totalSupply;
        uint256 amount1 = (liquidity * reserve1) / totalSupply;

        require(amount0 >= amountAMin && amount1 >= amountBMin, "LXONAMM: INSUFFICIENT_AMOUNT");

        _burn(msg.sender, liquidity);
        pairInfo.reserve0 -= uint112(amount0);
        pairInfo.reserve1 -= uint112(amount1);
        pairInfo.blockTimestampLast = uint32(block.timestamp);

        if (token0 != address(this)) {
            SafeERC20.safeTransfer(token0, address(this), amount0);
        }
        if (token1 != address(this)) {
            SafeERC20.safeTransfer(token1, address(this), amount1);
        }

        SafeERC20.safeTransfer(token0, to, amount0);
        SafeERC20.safeTransfer(token1, to, amount1);

        emit Sync(address(this), pairInfo.reserve0, pairInfo.reserve1);
        emit Burn(msg.sender, address(this), amount0, amount1);

        return (amountA, amountB);
    }

    /**
     * @dev Swap tokens using the AMM
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        address to
    ) external nonReentrant returns (uint256 amountOut) {
        require(pairs[tokenIn][tokenOut].token0 != address(0), "LXONAMM: PAIR_NOT_EXISTS");

        address token0 = pairs[tokenIn][tokenOut].token0;
        address token1 = pairs[tokenIn][tokenOut].token1;

        uint256 amountOut = _getAmountOut(amountIn, pairs[tokenIn][tokenOut].reserve0, pairs[tokenIn][tokenOut].reserve1);
        require(amountOut >= amountOutMin, "LXONAMM: INSUFFICIENT_OUTPUT_AMOUNT");

        SafeERC20.safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);

        if (tokenIn == token0) {
            SafeERC20.safeTransfer(tokenOut, to, amountOut);
        } else {
            SafeERC20.safeTransfer(token0, to, amountOut);
        }

        _update(pairs[tokenIn][tokenOut].token0, pairs[tokenIn][tokenOut].token1);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    /**
     * @dev Get current reserves for a pair
     */
    function getReserves(address tokenA, address tokenB) external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) {
        Pair storage pairInfo = pairs[tokenA][tokenB];
        return (pairInfo.reserve0, pairInfo.reserve1, pairInfo.blockTimestampLast);
    }

    /**
     * @dev Calculate amount out for a swap
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut) {
        return _getAmountOut(amountIn, reserveIn, reserveOut);
    }

    /**
     * @dev Calculate amount in for a swap
     */
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountIn) {
        return _getAmountIn(amountOut, reserveIn, reserveOut);
    }

    /**
     * @dev Quote price without state change
     */
    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) external pure returns (uint256 amountB) {
        return _quote(amountA, reserveA, reserveB);
    }

    // Internal functions

    function _getReserves(address self, address token0, address token1) internal view returns (uint256 reserve0, uint256 reserve1) {
        Pair storage pairInfo = pairs[token0][token1];
        reserve0 = uint256(pairInfo.reserve0);
        reserve1 = uint256(pairInfo.reserve1);
    }

    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256 amountOut) {
        uint256 amountInWithFee = amountIn * (10000 - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 10000 + amountInWithFee;
        return numerator / denominator;
    }

    function _getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256 amountIn) {
        uint256 numerator = reserveIn * amountOut * 10000;
        uint256 denominator = (reserveOut - amountOut) * (10000 - FEE_RATE);
        return (numerator / denominator) + 1;
    }

    function _quote(uint256 amountA, uint256 reserveA, uint256 reserveB) internal pure returns (uint256 amountB) {
        require(amountA > 0 && reserveA > 0 && reserveB > 0, "LXONAMM: INVALID_VALUES");
        return (amountA * reserveB) / reserveA;
    }

    function _mint(address to, uint256 amount0, uint256 amount1) internal {
        // Simplified LP token minting - in production, this would mint actual LP tokens
        // For now, we'll skip the LP token logic to focus on core AMM functionality
    }

    function _burn(address from, uint256 liquidity) internal {
        // Simplified LP token burning - in production, this would burn actual LP tokens
        // For now, we'll skip the LP token logic to focus on core AMM functionality
    }

    function _update(address token0, address token1) internal {
        Pair storage pairInfo = pairs[token0][token1];
        pairInfo.blockTimestampLast = uint32(block.timestamp);
        emit Sync(address(this), pairInfo.reserve0, pairInfo.reserve1);
    }

    function _getLPToken(address token0, address token1) internal pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(token0, token1)))));
    }
}

interface ILPToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function totalSupply() external view returns (uint256);
}