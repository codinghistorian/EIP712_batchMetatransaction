Abstract

1)This hardhat project deploys 3 ERC20 tokens and a proxy smart contract to ganache
2)The proxy smart contract parses, verify and execute batched meta-transactions requested by a relayer.
3)Relayer sends meta-transactions to the proxy. so that the proxy can mint tokens on behalf of the EIP712 signature signers.


Setting

0)Node.js, NPM version
Node : v14.17.3
NPM : 6.14.13

1)Hardhat version
2.8.0

2)Ganache GUI version
2.5.4

3) .env file
.env file needs to have ganache accounts private keys for reproduction.
Key : PRIVATE_KEY1
Value : wallet address in string
In this example I have 4 keys. Wallet1, wallet2, wallet3 and relayer.

4)Ownable.sol -> Ownable2.sol in Openzeppelin

I changed Owner state variable from private to public so that inheriting ERC20 contract can access the owner. The intention was to make sure whenever the mint button is pressed, owner of the ERC20
contract receives the newly minted token. IT IS A TERRIBLE PRACTICE since the Ownable contract's owner variable can 'potentially' change the state variable upstream.

5) Node module is up in the github
so npm install would be not neccessary.
and to run the code, please execute

npx hardhat run scripts/magic.js --network ganache



About the Smart contracts

#ReceiverV8#
This is the proxy contract which parses, verifies and execute batched meta-transactions.
In order to receive meta-transactions from a certain wallet address, the wallet addresse needs to be initiated. The initiation creates a mapping which keeps track of nonce value which I used like a salt for making a EIP712 signature.
BatchMetatransactions come in as arrays. And they are executed in interation in the function
batchExecute();

#ERC20#
I made this tokens to be extremely easy to mint since the whole focus of this project is the execute metatransaction in batch.



About the scripts magic.js

1)The scripts deploys 3 erc20 tokens and a proxy smart contract.
2)It generates EIP712 signatures signed by each wallets.
3)Once the signatures are generated, they are sent to proxy by relayer in forms of arrays.
4)The third token is purposedly given a wrong nonce when creating the signed signature so that it would not mint.
5)The scripts mints MyToken1 by 11111111111, MyToken2 by 22222222222 and MyToken3 by 0.
More detail can be found in the comments of magic.js file.

What I should have done but could not.

1)Setting up a server.
I could not do it. I got sick with COVID through the week.
But at least wanted to share what I have done so far.

Regarding the max number of metatransactions,
the block gas limit in ganache is 6721975
when I shoved in 3 metatransactions to mint tokens, it costed 79128.
by this figure, it is possible to shove in 84.95 metatransactions.
I could have saved upto 84 metatransactions in the server and then send them to the blockchain.

2)Development in Typescript.

Honestly, I am a lot more familiar with Javascript. So I thought I will just make everything in Javascript and then change them into Typescript. Yet again, I got sick and had no time to do it.