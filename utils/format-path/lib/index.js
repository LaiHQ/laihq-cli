/*
 * @Date: 2022-01-11 00:22:58
 * @LastEditors: lai_hq@qq.com
 * @LastEditTime: 2022-01-11 21:09:46
 * @FilePath: \laihq-web-servef:\code\ohuo\utils\format-path\lib\index.js
 */
'use strict';
const path = require("path")



function formatPath(p) {
    if (p && typeof p === "string") {
        const sep = path.sep;
        if (sep==="/") {
            return p
        } else {
            return p.replace(/\\/g,"/")
        }
    }
    console.log(sep)

    return p
}


module.exports = formatPath;