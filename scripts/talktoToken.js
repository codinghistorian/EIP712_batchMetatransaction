// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
// const UNISWAP = require("@uniswap/sdk");
// const INIT_CODE_HASH = require("@uniswap/sdk");

const fs = require('fs');

let rawdata = fs.readFileSync('addresses.json');
let addresses = JSON.parse(rawdata);
const mytoken1 = {
  address : addresses.token1
}
const mytoken2 = {
  address : addresses.token2
}
const mytoken3 = {
  address : addresses.token3
}
const receiverV8ADD = {
  address : addresses.receiver
}
console.log(mytoken1.address);
console.log(mytoken2.address);
console.log(mytoken3.address);

async function main() {
 const MyToken1 = await hre.ethers.getContractFactory("MyToken1");
 const myToken1 = await MyToken1.attach(
  mytoken1.address // The deployed contract address
);

const totalSupply1 = await myToken1.totalSupply();
console.log(totalSupply1);

const MyToken2 = await hre.ethers.getContractFactory("MyToken2");
const myToken2 = await MyToken2.attach(
 mytoken2.address // The deployed contract address
);

const totalSupply2 = await myToken2.totalSupply();
console.log(totalSupply2);


const MyToken3 = await hre.ethers.getContractFactory("MyToken2");
const myToken3 = await MyToken3.attach(
 mytoken3.address // The deployed contract address
);

const totalSupply3 = await myToken3.totalSupply();
console.log(totalSupply3);

// const ReceiverV8 = await hre.ethers.getContractFactory("ReceiverV8");
// const receiverV8 = await ReceiverV8.attach(
//  receiverV8ADD.address // The deployed contract address
// );

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
