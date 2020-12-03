/* eslint-disable no-undef */
const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const { interface, bytecode } = require("../compile");

const provider = ganache.provider();
const web3 = new Web3(provider);

describe("Lottery Contract", () => {
  let fetchedAccounts;
  let lottery;

  beforeEach(async () => {
    // Get a list of all accounts
    fetchedAccounts = await web3.eth.getAccounts();

    // Use one of the accounts to deploy the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({ data: bytecode })
      .send({ from: fetchedAccounts[0], gas: "1000000" });

    lottery.setProvider(provider);
  });

  it("should deploy a contract", async () => {
    assert.ok(lottery.options.address);
  });

  it("should correctly add a player to the players pool", async () => {
    await lottery.methods.enterLottery().send({
      from: fetchedAccounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: fetchedAccounts[0],
    });

    assert.strictEqual(fetchedAccounts[0], players[0]);
  });

  it("should correctly add multiple players to the players pool", async () => {
    for (let i = 0; i < 3; i++) {
      await lottery.methods.enterLottery().send({
        from: fetchedAccounts[i],
        value: web3.utils.toWei("0.02", "ether"),
      });

      const players = await lottery.methods.getPlayers().call({
        from: fetchedAccounts[i],
      });

      assert.strictEqual(players.length, i + 1);
      assert.strictEqual(fetchedAccounts[i], players[i]);
    }
  });

  it("should require a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enterLottery().send({
        from: fetchedAccounts[0],
        value: 200,
      });
      assert(false);
    } catch (e) {
      assert(e);
    }
  });

  it("should only allow manager to call pickWinner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: fetchedAccounts[1],
      });
      assert(false);
    } catch (e) {
      assert(e);
    }
  });

  it("should send money to the winner and reset the players pool", async () => {
    await lottery.methods.enterLottery().send({
      from: fetchedAccounts[0],
      value: web3.utils.toWei("2", "ether"),
    });

    const initialBalance = await web3.eth.getBalance(fetchedAccounts[0]);

    await lottery.methods.pickLotteryWinner().send({
      from: fetchedAccounts[0],
    });

    const finalBalance = await web3.eth.getBalance(fetchedAccounts[0]);
    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei("1.8", "ether"));
  });
});
