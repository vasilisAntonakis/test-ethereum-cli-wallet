const utils = require('ethers').utils

utils.timestampToUTC = (timestamp) => new Date(Number(timestamp + '000')).toUTCString()

utils.validateAddress = (address) => {
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error(`${address} is not a valid wallet address!`)
    }
}

utils.formatEtherCP = (value) => utils.formatEther(value, { commify: true, pad: true })

module.exports = utils