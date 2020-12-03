(async () => {
  const HDWalletProvider = require("@truffle/hdwallet-provider");
  const Web3 = require("web3");
  const { interface, bytecode } = require("./compile");
  const mnemonicPhrase =
    "series leader case favorite try captain apart dirt position quarter retreat digital";

  const provider = new HDWalletProvider({
    mnemonic: {
      phrase: mnemonicPhrase,
    },
    providerOrUrl:
      "https://rinkeby.infura.io/v3/2daa4a0bcdf04cb989864ae3bb36976d",
  });

  const web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: "0x" + bytecode })
    .send({ from: accounts[0] });

  console.log("Contract deployed to", result.options.address);

  provider.engine.stop();
})();
