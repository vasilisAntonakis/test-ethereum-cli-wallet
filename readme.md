# wellcome to ``test ethereum CLI wallet``
This is a (test) ethereum CLI wallet.
It consumes `Etherscan API` over 4 different `networks`:

 - `homestead` (mainnet)
 - `rinkeby` (testnet)
 - `ropsten` (testnet)
 - `kovan` (testnet)

Because this is a `test wallet` it's default network is `ropsten`.
If you want to change that:

 1. open `json/settings.json` file
 2. change `network` field to the one you want

## Prerequisites

 - Installed Node.js v8 or higher

## Libraries used
This wallet utilizes 4 libraries to operate:

 - [ethers.js](https://github.com/ethers-io/ethers.js)
 - [etherscan-api](https://github.com/sebs/etherscan-api)
 - [qrcode-terminal](https://github.com/gtanner/qrcode-terminal)
 - [html-pdf](https://github.com/marcbachmann/node-html-pdf)
 - [fs-extra](https://github.com/jprichardson/node-fs-extra)

the first two consume etherscan's API.
The first handles the wallets accounts and sending transactions
The second queries the network for things like
 - transaction list
 - ether price & supply

the 3rd makes convenient QR codes of the addresses
the 4th is used to create backups
and the last you know :)

## Usage
open folder in your favorite console and type:
1) `npm i` to download dependencies
2) `npm start` or `node .` to start the wallet
3) follow the instructions written
