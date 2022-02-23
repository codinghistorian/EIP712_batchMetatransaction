const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
require("dotenv").config();

async function main() {
 // 1) Deploy Tokens
 const MyToken1 = await hre.ethers.getContractFactory("MyToken1");
 const mytoken1 = await MyToken1.deploy();
 await mytoken1.deployed();
 console.log("mytoken1 is deployed at " + mytoken1.address);

 const MyToken2 = await hre.ethers.getContractFactory("MyToken2");
 const mytoken2 = await MyToken2.deploy();
 await mytoken2.deployed();
 console.log("mytoken2 is deployed at " + mytoken2.address);

 const MyToken3 = await hre.ethers.getContractFactory("MyToken3");
 const mytoken3 = await MyToken3.deploy();
 await mytoken3.deployed();
 console.log("mytoken3 is deployed at " + mytoken3.address);

// 2)Deploy Receiver which parses and execute meta-transaction
 const ReceiverV8 = await hre.ethers.getContractFactory("ReceiverV8");
 const receiverV8 = await ReceiverV8.deploy();
 await receiverV8.deployed();
 console.log("Receiver is deployed at " + receiverV8.address);

 let addresses = { 
  token1: mytoken1.address,
  token2: mytoken2.address, 
  token3: mytoken3.address,
  receiver: receiverV8.address,
};

let data = JSON.stringify(addresses);
fs.writeFileSync('addresses.json', data);


// 3)Check token balance
var totalSupplyTK1 = await mytoken1.totalSupply();
var totalSupplyTK2 = await mytoken2.totalSupply();
var totalSupplyTK3 = await mytoken3.totalSupply();

console.log("MyToken1's total supply is " + totalSupplyTK1);
console.log("MyToken2's total supply is " + totalSupplyTK2);
console.log("MyToken3's total supply is " + totalSupplyTK3);

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
