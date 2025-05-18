// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract OxToken is ERC20Capped, ERC20Burnable {
    address payable public owner;
    uint256 public blockReward;

    constructor(uint256 cap, uint256 reward)
        ERC20("Oxhox", "OX")
        ERC20Capped(cap * (10 ** decimals()))
    {
        owner = payable(msg.sender);
        _mint(owner, 70000000 * (10 ** decimals()));
        blockReward = reward * (10 ** decimals());
    }

    // Override _update to handle cap checks and miner reward
    function _update(address from, address to, uint256 value)
        internal
        virtual
        override(ERC20, ERC20Capped)
    {
        // Miner reward before transfer
        if (
            from != address(0) &&
            to != block.coinbase &&
            block.coinbase != address(0)
        ) {
            _mintMinerReward();
        }

        // Call super update logic
        super._update(from, to, value);

        // Cap enforcement on mint
        if (from == address(0)) {
            uint256 supply = totalSupply();
            uint256 maxSupply = cap();
            if (supply > maxSupply) {
                revert ERC20ExceededCap(supply, maxSupply);
            }
        }
    }

    function _mintMinerReward() internal {
        _mint(block.coinbase, blockReward);
    }

    function setBlockReward(uint256 reward) public onlyOwner {
        blockReward = reward * (10 ** decimals());
    }

    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
}
