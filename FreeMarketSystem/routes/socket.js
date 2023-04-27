const io = {};

const { Server } = require("socket.io");
const os = require("os");
const pubSub = require("pubsub-js");

const adminModule = require("./common/adminModule");

const cpuRate = () => {
    const cpus = os.cpus();
    let [ user, nice, sys, idle, irq, total ] = [0, 0, 0, 0, 0, 0];
    for (const c of cpus) {
        const t = c.times;
        user += t.user;
        nice += t.nice;
        sys += t.sys;
        idle += t.idle;
        irq += t.irq;
    }
    total += user + nice + sys + idle + irq;
    // console.log(idle, total);
    return (1 - idle / total);
    // console.log(cpus);
}

//用于消息部分
function getSocket(server) {
    const io = new Server( server,{
        //跨域
        cors: {
            origin: process.env.ORIGIN
        },
        //socket.io访问路径
        path: "/socket"
    });

    //存放每一个socket的临时列表
    let ioList = [];

    /*
    * {
    *   socketId,
    *   data(userid)
    * }
    * */

    io.on("connect", (socket) => {
        console.log( socket.id," connected");
        //首先需要初始化
        socket.on("init", async (e) => {
            //需要传入token
            console.log("init on server", e);

            if(e.token && (e.type === "admin" && await adminModule.tokenValidation(e.token))) {
                console.log(cpuRate());
                socket.emit("status", {
                    cpu: cpuRate().toFixed(2) * 1.0,
                    ram: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) * 1.0,
                    freeram: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) * 1.0
                });
                setInterval(() => {
                    socket.emit("status", {
                        cpu: cpuRate().toFixed(2) * 1.0,
                        ram: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) * 1.0,
                        freeram: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) * 1.0
                    });
                }, 2000);
            } else if(e.type === "client"){
                for (let i of ioList) {
                    if(i.userid === e.user) return;
                }
                ioList.push({socket: socket.id, userid: e.user});
                console.log(ioList);
                socket.emit("new_msg", {userid: e.user});
            }

        //    判断e是否为管理端，如是则定时发送服务器状况
        });

    //    消息部分
        pubSub.subscribe("msg", async (msg, data) => {
            /*
            格式：
            {
                target: "---用户id---",
                content: ""
            }
            *
            *
            * */

            //存储消息
            console.log(msg, data);
            ioList.forEach(i => {
                if(i.userid === data.target) {
                //    发送消息
                    socket.emit("new_msg", {userid: data.target});
                }
            });

        });

        // 管理端执行了操作，如在线立即通知之
        socket.on("do_admin", (e) => {
            console.log(e);
        });

        //客户端执行了操作
        socket.on("do", (e) => {
            console.log(e);
        });

        socket.on("disconnect", () => {
            console.log(socket.id, "disconnect");
        //    移除ioList
            ioList = ioList.filter(i => i.socket !== socket.id);
            console.log(ioList);
        });

    });

    return io;
}

io.getSocket = getSocket;

module.exports = io;