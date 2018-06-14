'use strict'

const rl = require('readline');

const readline = (description) => new Promise((resolve, reject) => {
    const rli = rl.createInterface({ input: process.stdin, output: process.stdout })
    rli.question(description, line => {
        rli.close()
        resolve(line)
    })
})

const log = (data, color) => {
    console.log(color)
    console.log(data)
    process.stdout.write('\x1b[0m')
}

const logYellow = (data) => log(data, '\x1b[33m')
const logRed = (data) => log(data, '\x1b[31m')
const logCyan = (data) => log(data, '\x1b[36m')

module.exports = {
    readline,
    logYellow,
    logRed,
    logCyan
}