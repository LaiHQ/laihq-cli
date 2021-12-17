

'use strict';
const axios = require("axios")
const urlJoin = require("url-join")
const semver = require("semver")

// 获取npm包信息
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

// 获取npm包所有版本
async function getNpmVersions(npmName,registry) {
    const data = await getNpmInfo(npmName, registry)
    if (data) {
        return Object.keys(data.versions)
    } else {
        return []
    }
}

// 获取 大于 某个版本的数组集合
function getSemverVersions(baseVersion,versions) {
    versions = versions.filter(version => {
        semver.satisfies(version,`^${baseVersion}`)
    }).sort((a,b) => semver.gt(b,a))
    return versions
}

async function getNpmSemverVersion(baseVersion,npmName,registry) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions = getSemverVersions(baseVersion, versions)
    if (newVersions && newVersions.length>0) {
        return newVersions[0]
    }
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersion
};