// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//I had to change the code of Ownable and make Ownable2 so that the owner variable is not private
import "@openzeppelin/contracts/access/Ownable2.sol";

contract MyToken1 is ERC20, Ownable2 {
    constructor() ERC20("MyToken1", "MT1") {}

    function mint(uint256 amount) external{
        _mint(_owner, amount);
    }
}
