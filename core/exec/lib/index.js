/*
 * @Date: 2022-01-02 23:38:19
 * @LastEditors: lai_hq@qq.com
 * @LastEditTime: 2022-01-12 20:52:37
 * @FilePath: \laihq-web-servef:\code\ohuo\core\exec\lib\index.js
 */

'use strict';
const path = require("path");
const Package = require("@ohuo/package")
const log = require("@ohuo/log")

const SETTINGS =  { 
    // init:"@ohuo/init"
    init:"ohuo"
}

const CACHE_DIR = "dependencies/"

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    let storeDir = "";
    let pkg;
    const homePath = process.env.CLI_HOME_PATH;
    log.verbose("targetPath", targetPath);
    log.verbose("homePath", homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName]
    const packageVersion = "latest"

    if (!targetPath) {
        // 生产缓存路径
        targetPath = path.resolve(homePath, CACHE_DIR);
        storeDir = path.resolve(targetPath, "node_modules");
        log.verbose("targetPath", targetPath);
        log.verbose("storeDir", storeDir);

        // 初始化package对象
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion,
            storeDir
        });
        // 判断package是否存在
        
        if (await pkg.exists()) {
            // 更新package
            console.log("更新package")
            pkg.update()
        } else {
            // 安装package
            await  pkg.install()
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion,
        });
    }
    const roootFile = pkg.getRoootFilePath();
    if (roootFile) {
        require(roootFile).apply(null, arguments);
    }
}


module.exports = exec;