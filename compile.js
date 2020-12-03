const path = require("path");
const fs = require("fs");
const solc = require("solc");

const lotteryPath = path.resolve(__dirname, "contracts", "Lottery.sol");
const sourceFile = fs.readFileSync(lotteryPath, "utf8");
const contract = solc.compile(sourceFile, 1).contracts[":Lottery"];

module.exports = contract;
