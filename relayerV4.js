const http = require('http');
const path = require('path');
const fs = require('fs');
require("dotenv").config();

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
const receiverV8 = {
  address : addresses.receiver
}



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
let wrongCounter = 2;

var nonceW1 = counter;
var nonceW2 = counter;
var nonceW3 = wrongCounter;

const ReceiverV8Artifact = require('./artifacts/contracts/4_ReceiverV8.sol/ReceiverV8.json');

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

let empty = async () => {
          signedSignatures = [];
          signers = [];
          targets = [];
          amounts = [];  
}

let batchExecute = async () => {
  await Receiver.batchExecute(
    amounts, 
    signedSignatures,
    targets,
    signers
    // {gasPrice: ethers.utils.parseUnits('20000000000', 'gwei'), gasLimit: 20000000000}
  );
}



// const twoMinute = 8000;

const clickTime = 2 * 15 * 1000;
//I set the time as such just for sake of showing
// metatransactions are sent by time condition or number of meta-transaction piled up


// one and half minute
// const twoMinute = 2 * 45 * 1000;

var now = new Date().getTime();
// var untilNextClickTime = twoMinute - (now % twoMinute);
var untilNextClickTime = clickTime

let refreshTimer = () => {
  untilNextClickTime = clickTime;
  console.log('time reset')
}

const server = http.createServer(async (req, res)=> {
      if (req.url === '/sign0'){
      

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



      let signer1 = wallet1.address;
      let signer2 = wallet2.address;
      let signer3 = wallet3.address;

      // var eightyFourGo = setInterval( async()=> {

 
      // }, randomNum);

      async function operate(rand) {
        now = new Date().getTime();
        // console.log('now(operate) is '+ now);
        // console.log('modulo '+ (now % twoMinute));

        // untilNextClickTime = untilNextClickTime - (now % twoMinute);
        untilNextClickTime = untilNextClickTime - rand;
        console.log('Timer(operate) is ' + untilNextClickTime)
        if(targets.length === 
          63

          //The most gas-efficient number of piling up and sending
          // meta-transactions would be 255
          //but ganache kind of goes crazy with that, so I just keep it down as 63

          ) {
          batchExecute();
          refreshTimer();
          // console.log('Timer is refreshed to ' + untilNextClickTime);
          console.log('BatchTransactionSent due to full metatransactions');
          empty();
          // now = new Date().getTime();

        }
        else if(untilNextClickTime <= 0
          // 126
          // 252
          ) {
          batchExecute();
          refreshTimer();
          // console.log('Timer2 is refreshed to' +untilNextClickTime);
          console.log('BatchTransactionSent due to time');
          empty();
          // now = new Date().getTime();
          
        }
        
        console.log(targets.length + ' Metransactions piled up');
        // console.log(signers.length);
        // console.log(amounts.length);
        const valueW1 = {amount:amount1, target: mytoken1.address, nonce: nonceW1};
        const valueW2 = {amount:amount2, target: mytoken2.address, nonce: nonceW2};
        const valueW3 = {amount:amount3, target: mytoken3.address, nonce: nonceW3};

        signatureW1 = await wallet1._signTypedData(domain,types,valueW1);
        nonceW1 = nonceW1 + 1;
        // console.log("wallet1's signature is " + signatureW1);
  
        signatureW2 = await wallet2._signTypedData(domain,types,valueW2);
        nonceW2 = nonceW2 + 1;
        // console.log("wallet2's signature is " + signatureW2);
  
        signatureW3 = await wallet3._signTypedData(domain,types,valueW3);
        nonceW3 = nonceW3 + 1;
        // console.log("wallet3's signature is " + signatureW3);

        // A very simple but effective way to check the validity of the signature
        let recoveredW1 = hre.ethers.utils.verifyTypedData(domain, types, valueW1, signatureW1);
        console.log('Is W1 signature valid? ' + (wallet1.address == recoveredW1));

        let recoveredW2 = hre.ethers.utils.verifyTypedData(domain, types, valueW2, signatureW2);
        console.log('Is W1 signature valid? ' + (wallet2.address == recoveredW2));

        let recoveredW3 = hre.ethers.utils.verifyTypedData(domain, types, valueW3, signatureW3);
        console.log('Is W1 signature valid? ' + (wallet3.address == recoveredW3));

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
  
        // console.log(amounts);
        // console.log(signedSignatures);
        // console.log(targets);
        // console.log(signers);
        console.log('current nonce is ' + nonceW1);
        // console.log(nonceW2);
        // console.log(nonceW2);



        // console.log(now);
        // console.log('Two minute mark left ' + untilNextClickTime);
        console.log('-------------------------------');
        }
        
        (function loop() {
            var rand = Math.round(Math.random() * (2500 - 300)) + 500;
            setTimeout(async function() {
                    await operate(rand);
                    loop();  
            }, rand);
            console.log("interval is " + rand);
        }());

// A very simple but effective way to check the validity of the signature
      // let recoveredW1 = hre.ethers.utils.verifyTypedData(domain, types, valueW1, signatureW1);
      // console.log(recoveredW1);
      // console.log(wallet1.address == recoveredW1);

      // let recoveredW2 = hre.ethers.utils.verifyTypedData(domain, types, valueW2, signatureW2);
      // console.log(recoveredW2);
      // console.log(wallet2.address == recoveredW2);

      // let recoveredW3 = hre.ethers.utils.verifyTypedData(domain, types, valueW3, signatureW3);
      // console.log(recoveredW3);
      // console.log(wallet3.address == recoveredW3);

        const users = [
          { Wallet1Sign : signatureW1},
          // { Validity1 : wallet1.address == recoveredW1},
          { nonce1 : nonceW1},
          { Wallet2Sign : signatureW2},
          // { Validity2 : wallet2.address == recoveredW2},
          { nonce2 : nonceW2},
          { Wallet3Sign : signatureW3}, 
          // { Validity3 : wallet3.address == recoveredW3},
          { nonce3 : nonceW3},
          // { executionResult : batchExecute}
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