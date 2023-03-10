const io = {};
const { Server } = require("socket.io");

//用于消息部分
function getSocket(server) {
    const io = new Server( server,{
        cors: {
            origin: process.env.ORIGIN
        },
        //socket.io访问路径
        path: "/socket"
    });

    //存放每一个socket的临时列表
    let ioList = [];

    /*
    *
    * {
    *   socketId,
    *   data(userid)
    *
    *
    * }
    *
    *
    * */

    io.on("connect", (socket) => {
        console.log( socket.id," connected");
        //首先需要初始化
        socket.on("init", () => {
            console.log("init on server");
            socket.emit("init");
        });

    //    消息部分

        // 管理端执行了操作，如在线立即通知之
        socket.on("do_admin", (e) => {
            console.log(e);
        });

        //客户端执行了操作
        socket.on("do", (e) => {
            console.log(e);
        });

    });

    return io;
}

io.getSocket = getSocket;

module.exports = io;