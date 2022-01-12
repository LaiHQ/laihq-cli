/*
 * @Date: 2022-01-10 22:01:55
 * @LastEditors: lai_hq@qq.com
 * @LastEditTime: 2022-01-12 20:55:09
 * @FilePath: \laihq-web-servef:\code\ohuo\models\package\lib\index.js
 */
'use strict';
const path = require("path");
const pkgDir = require("pkg-dir").sync;
const pathExists = require("path-exists").sync;
const npminstall = require("npminstall");
const fse = require("fs-extra");

const formatPath = require("@ohuo/format-path");
const {getDefaultRegistry,getNpmLastesVersion} =  require("@ohuo/get-npm-info")

const { isObject } = require("@ohuo/utils")
class Package {
    constructor(options) {
        if (!options) {
            throw new Error("Package类的options不能为空")
        }
        if (!isObject(options)) {
            throw new Error("Package类的options必须为Object")
        }
        // package的路径
        this.targetPath = options.targetPath;
        // 缓存package的路径
        this.storeDir = options.storeDir;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
        // package的缓存目录前缀
        this.cacheFilePathPreFix = this.packageName.replace("/","_")
    }

    // 
    async prepare() {
        // 如果存在缓存路径，找不到这个文件路径
        if (this.storeDir && !pathExists(this.storeDir)) {
            // 创建目录
            fse.mkdirpSync(this.storeDir)
        }
        if (this.packageVersion=="latest") {
            this.packageVersion = await getNpmLastesVersion(this.packageName)
        }
    }

    get cacheFilePath() {
        return path.resolve(this.storeDir,`_${this.cacheFilePathPreFix}@${this.packageVersion}@${this.packageName}`)
    }

    // 根据版本号生成路径
    getSpecificCacheFilePath(packageVersion) {
        return path.resolve(this.storeDir,`_${this.cacheFilePathPreFix}@${packageVersion}@${this.packageName}`)
    }


    // 判断当前package是否存在
    async exists() {
        // 缓存模式
        if (this.storeDir) {
            await this.prepare();
            return pathExists(this.cacheFilePath)
        } else {
            return pathExists(this.targetPath);
        }
    }
    // 安装package
    async install() {
        await this.prepare();
        return  npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [
                {
                    name: this.packageName,
                    version:this.packageVersion
                }
            ]
        })
    }
    // 更新package
    async update() {
        await this.prepare();
        // 1.获取最新的npm模块版本号
        const latestPackageVersion = await getNpmLastesVersion(this.packageName)
        // 2.查询最新的版本号对应的路径是否存在
        const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)
        // 3.如果不存在，则直接安装最新的版本
        if (!pathExists(latestFilePath)) {
            await npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [
                    {
                        name: this.packageName,
                        version:latestPackageVersion
                    }
                ]
            })
            this.packageVersion = latestPackageVersion;
        }
    }
    // 获取入口文件的路径
    getRoootFilePath() {
        // 1.获取package.json所在目录 - pkg-dir
        const dir = pkgDir(this.targetPath)
        // console.log(dir)
        if (dir) {
             // 2.获取package.json - require()
            const pkgFile = require(path.resolve(dir, "package.json"))
            // console.log(pkgFile)
            // 3.main/lib - path
            if (pkgFile && pkgFile.main) {
                // 4.路径得兼容（macOs，windows）
                return formatPath(path.resolve(dir,pkgFile.main))
            }
            return null;
        }
        return null;
    }

}
module.exports = Package;