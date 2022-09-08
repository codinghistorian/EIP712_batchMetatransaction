####Abstract####

1)This hardhat project deploys 3 ERC20 tokens and a proxy smart contract to ganache
2)The proxy smart contract parses, verify and execute batched meta-transactions requested by a relayer.
3)Relayer sends meta-transactions to the proxy. so that the proxy can mint tokens on behalf of the EIP712 signature signers.




####Environment####

0)Node.js, NPM version
Node : v14.17.3
NPM : 6.14.13

1)Hardhat version
2.8.0

2)Ganache GUI version
2.5.4
port number: 9545

3) .env file
.env file needs to have ganache accounts private keys for reproduction.
Key : PRIVATE_KEY1
Value : wallet address in string
In this example I have 4 keys. Wallet1, wallet2, wallet3 and relayer.

4)Ownable.sol -> Ownable2.sol in Openzeppelin

I changed Owner state variable from private to public so that inheriting ERC20 contract can access the owner. Although the intention was to make sure whenever the mint button is pressed, owner of the ERC20
contract receives the newly minted token. But it was a terrible mistake. Just could call a getter function which returns owner. It is also worth mentioning that IT IS A TERRIBLE PRACTICE to mess around with libraries. Changing private state variable to public is A HORRIBLE PRACTICE since the Ownable contract's owner variable can 'potentially' change the state variable upstream.

5) Node module is up in the github
so npm install would be not neccessary.
I know this is not the best practice but I messed with the files inside the node.modules, so.




####To see the simple version of the relayer####

Please first run ganache and execute

    npx hardhat run scripts/magic.js --network ganache

####To run the relayer server####

Please first run ganach and execute

    npx hardhat run scripts/deploy.js --network ganache

and then run

    node relayerV4.js

and then go to your browser and request with url below

    http://localhost:5000/sign0

then the server will keep generating metatransactions in random intervals.

Metatransactions will keep piling up.

Once the number of Metatransactions reaches 63, the metatransactions will be sent to blockchain.

Once the timer (which I set to 2 * 15 * 1000) clicks, the metatransactions will be sent to blockchain.

Two conditions above work without collision.

To see if metatransactions were indeed executeted.

please run

    npx hardhat run scripts/talktoToken.js --network ganache

It will show that first, second tokens were minted but the third one is not
(because I set the nonce wrong intentionally)




####About the Smart contracts####

#ReceiverV8#
This is the proxy contract which parses, verifies and execute batched meta-transactions.
In order to receive meta-transactions from a certain wallet address, the wallet addresse needs to be initiated. The initiation creates a mapping which keeps track of nonce value which I used like a salt for making a EIP712 signature.
BatchMetatransactions come in as arrays. And they are executed in interation in the function
batchExecute();



#ERC20#
I made this tokens to be extremely easy to mint since the whole focus of this project is the execute metatransaction in batch.




####Regarding relayerv4.js####

My server will send Metatransactions to blockchain under two conditions
First, when there are 63 metatransactions piled up.
Second, when one fourth of two minutes (2 * 15 * 1000) passes.

I wanted to make sure that the relayer works in gas efficiently but ganache cannot really
handle 84 metatransactions at a time.(It will just die)

So, the optimal condition to show that my relayer works either with time or the number of metatransactions piled up was as mentioned above.

Regarding the max number of metatransactions,
the block gas limit in ganache is 6721975
when I shoved in 3 metatransactions to mint tokens, it costed 79128.
by this figure, it is possible to shove in about 255 metatransactions.
I could have saved upto about 255 metatransactions in the server and then send them to the blockchain
(if ganache could handle)



####About scripts/magic.js#### 

1)The scripts deploys 3 erc20 tokens and a proxy smart contract.
2)It generates EIP712 signatures signed by each wallets.
3)Once the signatures are generated, they are sent to proxy by relayer in forms of arrays.
4)The third token is purposedly given a wrong nonce when creating the signed signature so that it would not mint.
5)The scripts mints MyToken1 by 11111111111, MyToken2 by 22222222222 and MyToken3 by 0.
More detail can be found in the comments of magic.js file.

This is a simplified version of how relayer and the smart contracts should work.



###regarding addresses.json###

Everytime you deploy smart contracts to ganache, the addresses will be recorded in

addresses.json

file.




###Archive###

Archive contains relayerV1 ~ relayerV3
It simply keeps track of how I was gradually solving problems one by one.
