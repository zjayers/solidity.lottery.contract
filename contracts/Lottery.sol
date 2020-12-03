pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
    }

    function enterLottery() public payable {
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }

    function getPlayers() public view returns (address[]) {
        return players;
    }

    function pickLotteryWinner() public restricted {

        uint256 winnerIndex = generateRandomNumber() % players.length;
        players[winnerIndex].transfer(this.balance);

        players = new address[](0);
    }

    function generateRandomNumber() private view returns (uint256) {
        return uint256(sha3(block.difficulty, now, players));
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}
