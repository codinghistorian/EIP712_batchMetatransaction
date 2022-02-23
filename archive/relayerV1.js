const http = require('http');
const path = require('path');
const fs = require('fs');
require("dotenv").config();


const mytoken1 = {
  address : '0x86881Ca7b28586A2e03734A284390b0C00eF32dD'
}
const mytoken2 = {
  address : '0x2C23f8C30cf8C661204339439b37c6ae114C66DD'
}
const mytoken3 = {
  address : '0x499f84144eE9c9b154dAf611f7e44396fe82AeFa'
}

const receiverV8 = {
  address : '0xf63c1f36cF29DE67E33C7Ca755E8266De3bf9c9f'
}

// mytoken1 is deployed at 0x86881Ca7b28586A2e03734A284390b0C00eF32dD
// mytoken2 is deployed at 0x2C23f8C30cf8C661204339439b37c6ae114C66DD
// mytoken3 is deployed at 0x499f84144eE9c9b154dAf611f7e44396fe82AeFa
// Receiver is deployed at 0xf63c1f36cF29DE67E33C7Ca755E8266De3bf9c9f



const hre = require("hardhat");
const url = "http://localhost:9545";
const privateKey1 = process.env.PRIVATE_KEY1;
const privateKey2 = process.env.PRIVATE_KEY2;
const privateKey3 = process.env.PRIVATE_KEY3;
const provider = new hre.ethers.providers.JsonRpcProvider(url)
const wallet1 = new hre.ethers.Wallet(privateKey1,provider);
const wallet2 = new hre.ethers.Wallet(privateKey2,provider);
const wallet3 = new hre.ethers.Wallet(privateKey3,provider);

var signedSignatures = [];      
var signers = [];
var targets = [];
var amounts = [];

let counter = 1;

var nonceW1 = counter;
var nonceW2 = counter;
var nonceW3 = counter;

const ReceiverV8Artifact = require('../artifacts/contracts/4_ReceiverV8.sol/ReceiverV8.json');

const abiReceiver = ReceiverV8Artifact.abi;

const privateKey4 = process.env.PRIVATE_KEY4;

const relayer = new hre.ethers.Wallet(privateKey4,provider);

var signatureW1;
var signatureW2;
var signatureW3;


const amount1 = 11111111111;
const amount2 = 22222222222;
const amount3 = 33333333333;
let Receiver = new hre.ethers.Contract(receiverV8.address,abiReceiver,relayer);

  
let init = async () => {
  const initW1 = await Receiver.init(wallet1.address);
  const initW2 = await Receiver.init(wallet2.address);
  const initW3 = await Receiver.init(wallet3.address);
}

init();



const server = http.createServer(async (req, res)=> {

      if (req.url === '/sign0'){
      console.log("check1");
      const domain = {
        name: 'TouchProxy',
        version: '1',
        chainId: 5777,
        verifyingContract: receiverV8.address
      };
      console.log("check2");
      const types = {
          Mint:  [
            { name: 'amount', type: 'uint256' },
            { name: 'target', type: 'address' },
            { name: 'nonce', type: 'uint256'}
          ]
      };

      const valueW1 = {amount:amount1, target: mytoken1.address, nonce: nonceW1};
      const valueW2 = {amount:amount2, target: mytoken2.address, nonce: nonceW2};
      const valueW3 = {amount:amount3, target: mytoken3.address, nonce: nonceW3};

      signatureW1 = await wallet1._signTypedData(domain,types,valueW1);
      console.log("wallet1's signature is " + signatureW1);

      signatureW2 = await wallet2._signTypedData(domain,types,valueW2);
      console.log("wallet2's signature is " + signatureW2);

      signatureW3 = await wallet3._signTypedData(domain,types,valueW3);
      console.log("wallet3's signature is " + signatureW3);

      nonceW1 = nonceW1 + 1;
      nonceW2 = nonceW2 + 1;
      nonceW3 = nonceW3 + 1;

      let recoveredW1 = hre.ethers.utils.verifyTypedData(domain, types, valueW1, signatureW1);
      console.log(recoveredW1);
      console.log(wallet1.address == recoveredW1);

      let recoveredW2 = hre.ethers.utils.verifyTypedData(domain, types, valueW2, signatureW2);
      console.log(recoveredW2);
      console.log(wallet2.address == recoveredW2);

      let recoveredW3 = hre.ethers.utils.verifyTypedData(domain, types, valueW3, signatureW3);
      console.log(recoveredW3);
      console.log(wallet3.address == recoveredW3);

      let signer1 = wallet1.address;
      let signer2 = wallet2.address;
      let signer3 = wallet3.address;


      signedSignatures.push(signatureW1);
      signedSignatures.push(signatureW2);
      signedSignatures.push(signatureW3);

      signers.push(signer1);
      signers.push(signer2);
      signers.push(signer3);

      targets.push(mytoken1.address);
      targets.push(mytoken2.address);
      targets.push(mytoken3.address);

      amounts.push(amount1);
      amounts.push(amount2);
      amounts.push(amount3);

      console.log(amounts);
      console.log(signedSignatures);
      console.log(targets);
      console.log(signers);


        
      console.log('check1')
      //So the receiver below is the contract that is called by the 'supposed to be' a node.js relayer.
      console.log('check2')
      // init when assigning signer address to a mapping of nonce
      // Also something my server was supposed to take care of.

      console.log('check3')


      // var intervalID = setInterval(()=> {
      //   console.log("sex");
      // }, 3000);

      // var timeIsUp = setInterval(async()=> {
        
      //   await Receiver.batchExecute(
      //     amounts, 
      //     signedSignatures,
      //     targets,
      //     signers
      //   );
      //   signedSignatures = [];
      // }, 30000);

      // var eightyFourGo = setInterval(()=> {
      //   if(signedSignatures.length == 84) {
      //     await Receiver.batchExecute(
      //       amounts, 
      //       signedSignatures,
      //       targets,
      //       signers
      //     );
      //     signedSignatures = [];
      //   }
      // }, 100);
      
      const batchExecute = await Receiver.batchExecute(
        amounts, 
        signedSignatures,
        targets,
        signers
        // {gasPrice: ethers.utils.parseUnits('20000000000', 'gwei'), gasLimit: 20000000000}
      );

      console.log(batchExecute);

        const users = [
          { Wallet1Sign : signatureW1},
          { Validity1 : wallet1.address == recoveredW1},
          { nonce1 : nonceW1},
          { Wallet2Sign : signatureW2},
          { Validity2 : wallet2.address == recoveredW2},
          { nonce2 : nonceW2},
          { Wallet3Sign : signatureW3}, 
          { Validity3 : wallet3.address == recoveredW3},
          { nonce3 : nonceW3},
          { executionResult : batchExecute}
        ];
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(users));
      }

      if (req.url === '/sign1'){

          
        console.log(amounts);
        console.log(signedSignatures);
        console.log(targets);
        console.log(signers);
        console.log(batchExecute);
      
          const users = [
            { Wallet1Sign : "hey"},
          ];
          res.writeHead(200, { 'Content-Type': 'application/json'});
          res.end(JSON.stringify(users));
        }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// 1) how to use Node.js as server
// 2) how to use syncroneous functions in Node.js

// array1 to be sent to the blockchain
// array2 to be used when array1's length max out or the relayer is sending metatransactions
// after everything, array1 = array2 and array2 =[]

// nonce of wallet's should also go up

// make array state variable
// I can just assign empty array once the batched executions are sent to the blockchain

// syncro
// settimeout(10 sec)[
//     signsignatures
// ]

// syncro
// setTimeout(5 bun) [
// const batchExecute = await Receiver.batchExecute(
//     amounts, 
//     signedSignatures,
//     targets,
//     signers
    // {gasPrice: ethers.utils.parseUnits('20000000000', 'gwei'), gasLimit: 20000000000}
  // );
// ]