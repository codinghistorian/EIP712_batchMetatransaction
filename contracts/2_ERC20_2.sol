// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable2.sol";

contract MyToken2 is ERC20, Ownable2 {
    constructor() ERC20("MyToken2", "MT2") {}

    function mint(uint256 amount) external{
        _mint(_owner, amount);
    }
}
