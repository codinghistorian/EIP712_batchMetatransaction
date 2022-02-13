// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable2.sol";

contract MyToken3 is ERC20, Ownable2 {
    constructor() ERC20("MyToken3", "MT3") {}

    function mint(uint256 amount) external{
        _mint(_owner, amount);
    }
}
