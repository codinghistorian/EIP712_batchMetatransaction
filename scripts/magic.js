const hre = require("hardhat");
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



// 3)Check token balance
var totalSupplyTK1 = await mytoken1.totalSupply();
var totalSupplyTK2 = await mytoken2.totalSupply();
var totalSupplyTK3 = await mytoken3.totalSupply();

console.log("MyToken1's total supply is " + totalSupplyTK1);
console.log("MyToken2's total supply is " + totalSupplyTK2);
console.log("MyToken3's total supply is " + totalSupplyTK3);

// 4)Get signatures
const url = "http://localhost:9545";

let privateKey1 = process.env.PRIVATE_KEY1;
let privateKey2 = process.env.PRIVATE_KEY2;
let privateKey3 = process.env.PRIVATE_KEY3;
let provider = new hre.ethers.providers.JsonRpcProvider(url)
const wallet1 = new hre.ethers.Wallet(privateKey1,provider);
const wallet2 = new hre.ethers.Wallet(privateKey2,provider);
const wallet3 = new hre.ethers.Wallet(privateKey3,provider);

const domain = {
  name: 'TouchProxy',
  version: '1',
  chainId: 5777,
  verifyingContract: receiverV8.address};

console.log("pass1");

const types = {
    Mint:  [
      { name: 'amount', type: 'uint256' },
      { name: 'target', type: 'address' },
      { name: 'nonce', type: 'uint256'}
    ]
};

console.log("pass2");

// Counter I use as nonce. I wanted to make a state which each wallet addresses is connected to
// I will make the last nonce wrong, so it won't work on smart contract.
var counter = 1;
var wrongCounter = 3;
var nonceW1 = counter;
var nonceW2 = counter;
var nonceW3 = wrongCounter;


const valueW1 = {amount:11111111111, target: mytoken1.address, nonce: nonceW1};
const valueW2 = {amount:22222222222, target: mytoken2.address, nonce: nonceW2};
const valueW3 = {amount:33333333333, target: mytoken3.address, nonce: nonceW3};


console.log("when the nonce counter is 1");
let signatureW1 = await wallet1._signTypedData(domain,types,valueW1);
console.log("wallet1's signature is " + signatureW1);

let signatureW2 = await wallet2._signTypedData(domain,types,valueW2);
console.log("wallet2's signature is " + signatureW2);

let signatureW3 = await wallet3._signTypedData(domain,types,valueW3);
console.log("wallet3's signature is " + signatureW3);



//The process of verifying Typed Data was supposed to be a way of checking whether
// the signature is valid of not in the replayer server.
let recoveredW1 = hre.ethers.utils.verifyTypedData(domain, types, valueW1, signatureW1);
console.log(recoveredW1);
console.log(wallet1.address == recoveredW1);

let recoveredW2 = hre.ethers.utils.verifyTypedData(domain, types, valueW2, signatureW2);
console.log(recoveredW2);
console.log(wallet2.address == recoveredW2);

let recoveredW3 = hre.ethers.utils.verifyTypedData(domain, types, valueW3, signatureW3);
console.log(recoveredW3);
console.log(wallet3.address == recoveredW3);

// 5)executeReceiverV8.js
const ReceiverV8Artifact = require('../artifacts/contracts/4_ReceiverV8.sol/ReceiverV8.json');

let abiReceiver = ReceiverV8Artifact.abi;

var privateKey4 = process.env.PRIVATE_KEY4;

const relayer = new hre.ethers.Wallet(privateKey4,provider);

const Mytoken1Add = mytoken1.address;
const Mytoken2Add = mytoken2.address;
const Mytoken3Add = mytoken3.address;
let ReceiverAdd = receiverV8.address;

let signedSignatureW1 = signatureW1;
let signedSignatureW2 = signatureW2;
let signedSignatureW3 = signatureW3;

let signer1 = wallet1.address;
let signer2 = wallet2.address;
let signer3 = wallet3.address;

let amount1 = 11111111111;
let amount2 = 22222222222;
let amount3 = 33333333333;

//Well, the cheapest way to make a batch of metatransaction is creating arrays.
//JSON can be another solution but parsing onchain is way more expensive, so I wouldn't go there.

let signedSignatures = [];      
let signers = [];
let targets = [];
let amounts = [];

signedSignatures.push(signedSignatureW1);
signedSignatures.push(signedSignatureW2);
signedSignatures.push(signedSignatureW3);

signers.push(signer1);
signers.push(signer2);
signers.push(signer3);

targets.push(Mytoken1Add);
targets.push(Mytoken2Add);
targets.push(Mytoken3Add);

amounts.push(amount1);
amounts.push(amount2);
amounts.push(amount3);

//So the receiver below is the contract that is called by the 'supposed to be' a node.js relayer.
let Receiver = new ethers.Contract(ReceiverAdd,abiReceiver,relayer);


// init when assigning signer address to a mapping of nonce
// Also something my server was supposed to take care of.

const initW1 = await Receiver.init(wallet1.address);
const initW2 = await Receiver.init(wallet2.address);
const initW3 = await Receiver.init(wallet3.address);

const batchExecute = await Receiver.batchExecute(
  amounts, 
  signedSignatures,
  targets,
  signers
  // {gasPrice: ethers.utils.parseUnits('20000000000', 'gwei'), gasLimit: 20000000000}
);

// 6)Check token balance to see if it changed.
var totalSupplyTK1 = await mytoken1.totalSupply();
var totalSupplyTK2 = await mytoken2.totalSupply();
var totalSupplyTK3 = await mytoken3.totalSupply();
console.log("MyToken1's total supply is " + totalSupplyTK1);
console.log("MyToken2's total supply is " + totalSupplyTK2);
console.log("MyToken3's total supply is " + totalSupplyTK3);

//if you run this scripts and see the total supply,
// Mytoken1 should mint 11111111111
// Mytoken2 should mint 22222222222
// Mytoken3 should mint 0

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
