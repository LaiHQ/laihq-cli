
'use strict';
const log = require("npmlog");

// 日志打印的级别 =>判断debug模式
log.level =   process.env.LOG_LEVEL ?process.env.LOG_LEVEL :"info"

// 日志打印的的前缀
log.heading = "@plom/cli"
// 前缀style
log.headingStyle = {
    fg: "green",
    bg:"black"
}

// 自定义的事件
log.addLevel("success",2000,{fg:"green",bold:true})

module.exports = log;
