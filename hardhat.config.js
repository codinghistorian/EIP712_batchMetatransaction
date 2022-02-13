require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  networks: {
    // hardhat: {
    // },
    // rinkeby: {
    //   url: "https://eth-rinkeby.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
    //   accounts: [privateKey1, privateKey2, ...]
    // }
    ganache: {
      url: "http://localhost:9545",
      accounts: ["0571e298930b0385f1af2cf27215d5280fd18a7c250531d7c246be51796d4413",
      "7f7773aa7bb2a4069c531ed5e26a5f3e15bef7142e59ce51d827972ed6e80706",
      "4b5b8be91cabefee2df86d35c10716258eaecc2a785259a4950ac44d5a93ce87"
    ]
    }
  },
};
