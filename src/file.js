'use strict'

const fse = require('fs-extra')
const slash = process.platform === 'win32' ? '\\' : '/'

function getFullPath(fileName) {
    const dir = __dirname + slash + '..' + slash + 'json'
    fse.ensureDirSync(dir)
    return dir + slash + fileName
}

function saveJSON(fileName, json, override = false) {
    const file = getFullPath(fileName)
    if (!override && fse.existsSync(file)) {
        let copy = 1;
        let backupFile = file.replace('.json', `_${copy}.json`);
        while (fse.existsSync(backupFile)) {
            backupFile = file.replace('.json', `_${++copy}.json`);
        }
        fse.renameSync(file, backupFile)
    }
    fse.writeJSONSync(file, json)
}

function fetchJSON(fileName) {
    const file = getFullPath(fileName)
    if (fse.existsSync(file)) {
        return fse.readJSONSync(file)
    }
}

module.exports = {
    saveJSON,
    fetchJSON
}