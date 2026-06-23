// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SignalStaking {
    mapping(address => uint256) public stakes;
    uint256 public constant MIN_STAKE = 0.001 ether;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    function stake() external payable {
        require(msg.value >= MIN_STAKE, "Minimum stake is 0.001 ETH");
        stakes[msg.sender] += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    function unstake() external {
        uint256 amount = stakes[msg.sender];
        require(amount > 0, "Nothing staked");
        stakes[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit Unstaked(msg.sender, amount);
    }

    function getStake(address user) external view returns (uint256) {
        return stakes[user];
    }
}
