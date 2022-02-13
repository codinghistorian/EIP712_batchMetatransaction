// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IIERC20 {
    function mint(uint256 amount) external;
}

contract ReceiverV8 {
    constructor() {
        DOMAIN_SEPARATOR = hashDomain(
        EIP712Domain({
         name: "TouchProxy",
         version: '1',
         chainId: 5777,
         verifyingContract: address(this)
        }));
    }

    IIERC20 iierc20;
    
    struct EIP712Domain {
        string  name;
        string  version;
        uint256 chainId;
        address verifyingContract;
    }
    //I should also add target here..
    struct Mint {
        uint256 amount;
        address target;
        uint256 nonce;
    }

    bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    bytes32 constant MINT_TYPEHASH = keccak256(
        "Mint(uint256 amount,address target,uint256 nonce)"
    );

    bytes32 DOMAIN_SEPARATOR;

    function hashDomain(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            EIP712DOMAIN_TYPEHASH,
            keccak256(bytes(eip712Domain.name)),
            keccak256(bytes(eip712Domain.version)),
            eip712Domain.chainId,
            eip712Domain.verifyingContract
        ));
    }

    function hashMint(Mint memory mint) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            MINT_TYPEHASH,
            // keccak256(abi.encodePacked(mint.amount)),
            //210202 should never ever abi.encodePacked and keccak256 for uint... daaamn.
            mint.amount,
            mint.target,
            mint.nonce
        ));
    }
    

    mapping(address => uint256) private nonces;
    // address[] public signerAddresses;
    function init(address signer) public {
        // signerAddresses.push(signer);
        nonces[signer] = 1;
    }

    function recover(Mint memory mint, uint8 v, bytes32 r, bytes32 s) internal view returns (address) {
    
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            hashMint(mint)
        ));
        
        // return ecrecover(digest, v, r, s) == 0x271c0ae779899dD1207a8Dea9362A8AE9e0e49aE;

        return ecrecover(digest, v, r, s);
        // 20220205 maybe there is a way to turn the addresse above into mapping value..?
        // I mean when here are many addresses to dealwith. .. hm... I will think about this.

        // Needs to be 0x271c0ae779899dD1207a8Dea9362A8AE9e0e49aE
        
    }
    //target should also be added in the signature.
     function batchExecute(uint256[] memory amounts, bytes[] memory signatures, address[] memory targets, address[] memory signers) public returns (string memory) {
        for(uint i = 0; i < amounts.length; i++) {

            uint256 amount = amounts[i];
            address target = targets[i];
            uint256 nonce = nonces[signers[i]];
            bytes memory signature = signatures[i];
            address signer = signers[i];

            Mint memory mint = Mint({
            amount: amount,
            target: target,
            nonce: nonce
            });
                    
            uint8 v;
            bytes32 r;
            bytes32 s;


            (v, r, s) = splitSignature(signature);

            //so that even for the failed meta-transaction attempt, the signer's nonce would go up.
            address veriAdd = recover(mint, v,r,s);
            nonces[signer]++;
            if(signer != veriAdd) {
                continue;
            }
            require(signer == veriAdd, "verification failed");
            iierc20 = IIERC20(target);
            iierc20.mint(amount);

        }
        return "haha";
    }
        
    function splitSignature(bytes memory sig)
       internal
       pure
       returns (uint8, bytes32, bytes32)
   {
       require(sig.length == 65);

       bytes32 r;
       bytes32 s;
       uint8 v;

       assembly {
           // first 32 bytes, after the length prefix
           r := mload(add(sig, 32))
           // second 32 bytes
           s := mload(add(sig, 64))
           // final byte (first byte of the next 32 bytes)
           v := byte(0, mload(add(sig, 96)))
       }
     
       return (v, r, s);
   }
}
