const settings = require('./file').fetchJSON('settings.json')
const io = require('./io')
const etherscan = require('etherscan-api').init(settings.apiKey, settings.network, '3000')
const wallet = require('./wallet')
const utils = require('./utils')

function printTransactions(nextMenu) {
    etherscan.account.txlist(wallet.getAddress(), 1, 'latest', 'asc')
        .then(data => {
            if (data.result.length === 0) {
                io.logYellow(data.message)
            } else {
                const line = '--------------------------------------------------------------------------------------'
                const addr = (address) => address.toLowerCase() === wallet.getAddress().toLowerCase() ? 'you' : address
                io.logYellow(`total transactions: ${data.status}`)
                for (const tx of data.result) {
                    io.logYellow(line)
                    io.logYellow(`${addr(tx.from)} send to ${addr(tx.to)} ${utils.formatEtherCP(tx.value)} ether\nat ${utils.timestampToUTC(tx.timeStamp)}`)
                    io.logYellow(`nonce: ${tx.nonce}\ngas: ${tx.gas}\ngas price: ${utils.formatEtherCP(tx.gasPrice)} Ether\ngas used: ${tx.gasUsed}\ntransaction cost: ${utils.formatEtherCP(tx.gasPrice * tx.gasUsed)} Ether\n\nblock: ${tx.blockNumber}\ncumulative gas used (in block): ${tx.cumulativeGasUsed}\nconfirmations: ${tx.confirmations}`)
                }
                io.logYellow(line)
            }
            nextMenu()
        })
        .catch(error => {
            if (error === 'No transactions found') {
                io.logYellow(error)
                nextMenu()
            } else {
                throw error;
            }
        })
}

function printEtherLastPriceAndTotalSupply(nextMenu) {
    Promise.all([
        etherscan.stats.ethprice(),
        etherscan.stats.ethsupply()
    ]).then(data => {
        io.logYellow(`${data[0].result.ethbtc} BTC (last update: ${utils.timestampToUTC(data[0].result.ethbtc_timestamp)})`)
        io.logYellow(`${data[0].result.ethusd} USD (last update: ${utils.timestampToUTC(data[0].result.ethusd_timestamp)})`)
        io.logYellow(`current total supply of Ether: ${data[1].result}`)
        nextMenu()
    })
}

module.exports = {
    printTransactions,
    printEtherLastPriceAndTotalSupply
}