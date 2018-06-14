'use strict'

const io = require('./io')
const wallet = require('./wallet')
const etherscan = require('./etherscan')

function help(nextMenu) {
    io.logCyan('type any character from the menu in order to execute the corresponding function.')
    io.logCyan('\n\t- messages from us (the wallet) will be in Cyan like this.')
    io.logYellow('\t- messages from the blockchain or data will be in Yellow like this.')
    io.logRed('\t- and error messages from all sources will be in Red like this.')
    io.logCyan('\nplease note that when a function is executed, we do not listen to the command line until it is complete.')
    io.logCyan('you will be prompted to the main menu or a sub menu as soon as the execution is complete.')
    nextMenu()
}

const mainMenuCommands = {
    1: { desc: 'print public address', command: wallet.printAddress },
    2: { desc: 'print balance', command: wallet.printBalance },
    3: { desc: 'print transactions', command: etherscan.printTransactions },
    4: { desc: 'print Ether\'s last price and total supply', command: etherscan.printEtherLastPriceAndTotalSupply },
    5: { desc: 'send a transaction', command: wallet.sendTransaction },
    6: { desc: 'export wallet into PDF', command: wallet.exportWalletToPDF },
    h: { desc: 'help', command: help },
    x: { desc: 'exit', command: () => io.logCyan('thank you for using test ethereum CLI wallet') }, // no callback for nextMenu => app exits
}

const mainMenuDescription = `
Please choose a function:

${Object.keys(mainMenuCommands).map(key => `  ${key}. ${mainMenuCommands[key].desc}`).join('\n')}

> `

const mainMenu = () => {
    io.readline(mainMenuDescription).then(option => {
        if (mainMenuCommands[option]) {
            mainMenuCommands[option].command(mainMenu)
        } else {
            io.logRed('Unknown command. Please type a character from the menu.')
            mainMenu()
        }
    })
}

// global error handler => just log the error in red and exit
process.on('unhandledRejection', (reason, p) => io.logRed(reason));

io.logCyan('Wellcome to test ethereum CLI wallet')
mainMenu()
