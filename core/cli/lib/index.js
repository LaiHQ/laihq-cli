
'use strict';

const path = require("path")
// 对比版本
const semver = require("semver");
// 打印console的
const colors = require("colors")
const userHome = require("user-home")
const pathExist = require("path-exists").sync


const pkg = require("../package.json")

const log = require("@ohuo/log")

const constant = require("./const");

let args,config;

async function core() {
    try {
        // 1.检查版本号 => 是否升级等
        checkPkgVersion()
        // 获取node版本号 => 是否小于项目最低版本要求
        checkNodeVersion()
        //  检查root启动 => 系统登录的用户权限root用户创建文件的话很多功能没法操作
        checkRoot()
        // 检查用户主目录 =>
        checkUserHome()
        //检查命令 入参 =>如是否开启调试模式
        checkInputArgs()
        log.verbose("debug", "test debug log...")
        // 检查环境变量 => 可以在操作系统中配置环境变量，如将用户的敏感信息保存在本地，或者做配置信息等
        checkEnv()
        // 检查是否需要全局更新
        await checkGlobaUpdate()
    } catch (e) {
       log.error(e.message)
    }
}

async function checkGlobaUpdate() {
    // 1.获取版本号和模块名
    const currentVersion = pkg.version;
    const npmName = pkg.name;
    // 2.调用npm API 获取所有版本号
    const { getNpmVersions } = require("@ohuo/get-npm-info")
    const versions = await getNpmVersions(npmName)
    console.log(versions);
    // 3.提取所有的版本号，比对哪些版本号是大于当前版本号

    
    // 4.获取最新版本号，提示用户更新到该版本
}




function checkEnv() {
    // dotenv 用于加载环境变量，可以在用户的主目录下创建。env文件然后获取
    const dotenv = require("dotenv")
    // 用户主目录下存在.env文件
    const dotenvPath = path.resolve(userHome, ".env")
    // 如果路径存在
    if (pathExist(dotenvPath)) {
        dotenv.config({
            path:dotenvPath
        });
    }
    createDefaultConfig();
    log.verbose("环境变量", process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
    const cliConfig = {
        home:userHome,
    }
    if (process.env.ClI_HOME) {
        cliConfig["cliHome"] = path.join(userHome,process.env.ClI_HOME)
    } else {
        cliConfig["cliHome"] = path.join(userHome,constant.DEfAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome
}

function checkInputArgs() {
    // 解析命令参数
    const minimist = require("minimist");
    args = minimist(process.argv.splice(2))
    // 是否调试模式
    checkArgs()
}

function checkArgs() {
    if (args.debug) {
        process.env.LOG_LEVEL = "verbose"
    } else {
        process.env.LOG_LEVEL = "info"
    }
    log.level  = process.env.LOG_LEVEL
}

function checkUserHome() {
    // 如果用户主目录不存在 或者路径也不存在
    if (!userHome || !pathExist(userHome)) {
        throw new Error(colors.red(`当前登录用户主目录不存在`))
    }
}

function checkRoot() {
    // root-check的2.0版本中在package.json中设置了type:’module’,它将该包范围内的所有.js文件定义为ES模块，node无法识别，所以通过require 方式导入报错，直接把root-check的版本降到1.0.0
    const rootCheck = require("root-check")
    // 降级原因是root用户创建文件的话很多功能没法操作
    rootCheck();
    // process.geteuid()不支持windows系统
    if (process.geteuid) {
        // 获取启动用户，默认501
        console.log("current uid:",process.geteuid())
    }
}


function checkNodeVersion() {
    // 1.获取当前node版本号
    const currentVersion = process.version;
    // 2.比对最低版本号
    const lowestVersion = constant.LOWEST_NODE_VERSION;
    // 如果当前的版本号没有 大于 最低的版本号
    if (!semver.gte(currentVersion,lowestVersion)) {
        throw new Error(colors.red(`需要安装 v${lowestVersion}以上版本的 Node.js`))
    }
}

function checkPkgVersion() {
    log.info("cli版本:", pkg.version);
}


module.exports = core;