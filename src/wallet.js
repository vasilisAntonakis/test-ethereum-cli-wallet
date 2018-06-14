'use strict'

const io = require('./io')
const file = require('./file')
const ethers = require('ethers')
const qrcode = require('qrcode-terminal')
const utils = require('./utils')
const pdf = require('html-pdf')

const settings = file.fetchJSON('settings.json')

const provider = new ethers.providers.EtherscanProvider(ethers.providers.networks[settings.network], settings.apiKey)
const fileName = 'wallet.json'
let wallet = file.fetchJSON(fileName)

if (wallet) {
    wallet = new ethers.Wallet(wallet.privateKey, provider)
} else {
    wallet = ethers.Wallet.createRandom()
    wallet.provider = provider
    file.saveJSON(fileName, { privateKey: wallet.privateKey, address: wallet.address, mnemonic: wallet.mnemonic, path: wallet.path })
}

function validateWallet() {
    const savedWallet = file.fetchJSON(fileName)
    if (!savedWallet) {
        throw new Error(`${fileName} file is not found!`)
    }
    if (wallet.address !== savedWallet.address || wallet.privateKey !== savedWallet.privateKey) {
        throw new Error(`${fileName} file does not match with the loaded wallet!`)
    }
}

function getAddress() {
    validateWallet()
    return wallet.address
}

function printAddress(nextMenu) {
    validateWallet()
    qrcode.generate(wallet.address, { small: true }, qr => io.logYellow(qr));
    io.logYellow(wallet.address)
    nextMenu()
}

function printBalance(nextMenu) {
    validateWallet()
    wallet.getBalance().then(BN => {
        const balanceInEther = utils.formatEtherCP(BN)
        io.logYellow(`You have: ${balanceInEther} Ether`)
        nextMenu()
    })
}

function sendTransaction(nextMenu) {
    validateWallet()

    Promise.all([
        wallet.getBalance(),
        wallet.provider.getGasPrice()
    ]).then(data => {

        // calculate maxSpend
        const balance = data[0]
        const gasPrice = data[1]
        const gasLimit = utils.bigNumberify(settings.defaultGasLimit)
        const maxSpend = balance.sub(gasPrice.mul(gasLimit))

        if (maxSpend.lte(0)) {
            io.logCyan('You do not have enough Ether to transact. Transaction has been cancelled!')
            nextMenu()
            return
        }

        // ask for the address. promises are wrapped in internal functions in order to be recalled recursively when user input is wrong
        function askAddress() {
            io.readline('\ntype the recipient\'s address or "0" to cancel the transaction: ').then(address => {

                // check if the user wants to cancel the transaction
                if (address === '0') {
                    io.logCyan('transaction has been cancelled!')
                    nextMenu()
                    return
                }

                // validate the address
                utils.validateAddress(address)

                if (address === wallet.address) {
                    throw new Error('you cannot send transactions to your own wallet.')
                }

                // ask for the ether amount
                function askEthers() {
                    io.readline(`\nenter ethers to send or 0 to cancel the transaction.\nthe maximum amount you can send is ${utils.formatEtherCP(maxSpend)} Ether\n> `)
                        .then(value => {
                            if (Number(value) === 0) {
                                io.logCyan('transaction has been cancelled!')
                                nextMenu()
                                return
                            }
                            value = utils.parseEther(value)

                            // if value > maxSpend => throw Error
                            if (value.gt(maxSpend)) {
                                throw new Error(`you cannot send ${utils.formatEtherCP(value)
                                    } Ether. It exceeds the maximum value you can spend (${utils.formatEtherCP(maxSpend)}).`)
                            } else if (value.lt(0)) {
                                throw new Error('you cannot send negative Ether.')
                            }

                            // create the transaction object
                            const tx = { to: address, value, gasPrice, gasLimit };

                            // make the transaction
                            wallet.sendTransaction(tx)
                                .then(txResponse => {
                                    io.logYellow(`transaction send successfully:`)
                                    io.logYellow(`nonce: ${txResponse.nonce
                                        }\ngasPrice: ${utils.formatEtherCP(txResponse.gasPrice)
                                        }\ngasLimit: ${txResponse.gasLimit
                                        }\nvalue: ${utils.formatEtherCP(txResponse.value)
                                        }\nfrom: you (${txResponse.from})\nto: ${txResponse.to
                                        }\n\ntransaction hash: ${txResponse.hash}`)
                                    nextMenu()
                                })
                        })
                        .catch(error => {
                            // whenever the value in not valid or it exceeds the maxSpend (or 0 for exit ofcourse), function askEthers() will be recalled recursively
                            io.logRed(error.message)
                            askEthers()
                        })
                }
                askEthers()
            }).catch(error => {
                // whenever the address in not valid (or 0), function askAddress() will be recalled recursively
                io.logRed(error.message)
                askAddress()
            })
        }
        askAddress()
    })
}

function exportWalletToPDF(nextMenu) {
    validateWallet()
    qrcode.generate(wallet.address, { small: true }, (addressQR) => {
        qrcode.generate(wallet.privateKey, { small: true }, (PKQR) => {
            pdf.create(`<html><body style="font-family:arial;text-align:center;padding: 1em 0">
                    <div>
                        <h1>Ethereum Wallet Info</h1>
                        <p>This file is your wallet backup. Please print it and keep it safe and private!</p>
                    </div>
                    <hr style="margin: 2em 0">
                    <div style="color:green">
                        <h2>Public Address</h2>
                        <h3>${wallet.address}</h3>
                        <pre>${addressQR}</pre><br>
                    </div>
                    <hr style="margin: 2em 0">
                    <div style="color:red">
                        <h2>Private Key</h2>
                        <h3>${wallet.privateKey}</h3>
                        <pre>${PKQR}</pre><br>
                    </div>
                    </body></html>`, { format: 'Letter' }).toFile('./wallet_backup.pdf', (err, res) => {
                    if (err) {
                        io.logRed(err)
                    } else {
                        io.logCyan(`${res.filename.replace(/\\\\/g, '\\')} is created!`)
                    }
                    nextMenu()
                })
        })
    })
}

module.exports = {
    getAddress,
    printAddress,
    printBalance,
    sendTransaction,
    exportWalletToPDF
}