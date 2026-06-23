// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WalletRegistry {
    mapping(address => address[]) private watchlists;

    event WalletAdded(address indexed user, address indexed watched);
    event WalletRemoved(address indexed user, address indexed watched);

    function addWallet(address wallet) external {
        watchlists[msg.sender].push(wallet);
        emit WalletAdded(msg.sender, wallet);
    }

    function removeWallet(address wallet) external {
        address[] storage list = watchlists[msg.sender];
        for (uint i = 0; i < list.length; i++) {
            if (list[i] == wallet) {
                list[i] = list[list.length - 1];
                list.pop();
                emit WalletRemoved(msg.sender, wallet);
                return;
            }
        }
    }

    function getWatchlist() external view returns (address[] memory) {
        return watchlists[msg.sender];
    }
}
