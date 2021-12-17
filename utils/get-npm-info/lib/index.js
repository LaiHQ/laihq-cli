

'use strict';
const axios = require("axios")
const urlJoin = require("url-join")
const semver = require("semver")


function getNpmInfo(npmName,registry) {
    if (!npmName) {
        return null
    }
    const registryUrl = registry || getDefaultRegistry();
    const npmInfoUrl = urlJoin(registryUrl, npmName)
    // 获取包在npm的信息
    return axios.get(npmInfoUrl).then(response => {
        if (response.status===200) {
            return response.data
        } else {
            return null
        }
    }).catch((err) => {
        return Promise.reject(err)
    })
}

function getDefaultRegistry(isOriginal =false) {
    return isOriginal? "https://registry.npmjs.org":"https://registry.npm.taobao.org"
}

async function getNpmVersions(npmName,registry) {
    const data = await getNpmInfo(npmName, registry)
    if (data) {
        return Object.keys(data.versions)
    } else {
        return []
    }
}


module.exports = {
    getNpmInfo,
    getNpmVersions
};