import React, {useEffect, useState} from 'react';
import ReactEcharts from "echarts-for-react"
import {http} from "@tauri-apps/api";
import {Card, Empty} from "antd";
import {io} from "socket.io-client";

import cfg from "@/common/cfg.json";

import "./main.scss";
import {confirm} from "@tauri-apps/api/dialog";
import ReportUnit from "@/components/report_unit/report_unit";

function Main(props: any) {

    //图表数据——内含非ASCII字符，需要使用UTF-8字符集
    //问题：无法立即更新图表
    // const [ source, setSource ] = useState([
        // {name: "商品", 条数: 10},
        // {name: "帖子", 条数: 10},
        // {name: "评论", 条数: 10},
        // {name: "举报", 条数: 10},
        // ["商品", 10],
        // ["帖子", 10],
        // ["评论", 10],
        // ["举报", 10],
    // ]);
    //使用state时出现了图表不更新的问题


    let _source: never[] = [];

    const ops = {
        title: {
            text: "近30天的发表数据",
        },
        tooltip: {},
        dataset: {
            dimensions: ["项目","条数"],
            source: _source
        },
        legend: {
        },
        xAxis: { type: 'category'},
        yAxis: {},
        series: [{type: 'bar'}]
    };

    //从redux获取数据条数
    // const { data_count } = useSelector((state) => state.common);

    const [ option, setOption ] = useState(ops);
    const [ recent, setRecent ] = useState([]);
    const [ status, setStatus ] = useState({});
    const [ ramUsage, setRamUsage ] = useState(0.0);

    const getCount = () => {
        http.fetch(`${cfg.base_url}api/admin/count`, {
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token"),
                time: {post_date: { $gt: new Date().getTime() - (60*60*24*30*1000)}},
                isChart: true
            })
        }).then(r => {
            if(r.status === 200){
                setOption({
                    ...ops, dataset: {
                        dimensions: ["name", "条数"],
                        //@ts-ignore
                        source: r.data.data
                    }
                });
            }
        });
    }

    const getRecentReport = () => {
        http.fetch(`${cfg.base_url}api/admin/get_report`,{
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token"),
                isRecent: true
            })
        }).then(r => {
            //@ts-ignore
            setRecent(r.data);
        });
    }

    const handleReport = async (type, r, i) => {
        if(await confirm("是否继续？", {
            title: "确认",
            type: "info"
        })) {
            http.fetch(`${cfg.base_url}api/admin/handle_report`, {
                method: "POST",
                body: http.Body.json({
                    token: localStorage.getItem("token"),
                    type: type,
                    report: r,
                    target: i
                })
            }).then(r => {
                console.log(r);
                if(r.status === 200) {
                    getRecentReport();
                }
            });
        }
    }

    useEffect(() => {
    //    加载近段时间的数据
        getRecentReport();
        getCount();
    }, []);

    //socket.io hook，用在其他地方时，会随着每一次渲染而增加连接，从而导致耗尽websocket资源
    //在useEffect中使用return闭包，相当于componentWillUnmount生命周期
    useEffect(() => {
        const socket = io(`${cfg.base_url}`, {
            transports: ["websocket"],
            path: "/socket",
            timeout: 5000
        });

        console.log(socket);
        if(socket){
            if(!socket.connected)
                socket.connect();
            socket.on("connect", () => {
                // console.log(socket, "connected");
                socket.emit("init", { type: "admin", token: localStorage.getItem("token") });
            });
            socket.on("status",(e) => {
                console.log(e);
                setStatus({...e});

                const { ram, freeram } = e;
                //@ts-ignore
                setRamUsage((((ram - freeram)/ram) * 100).toFixed(2));
            });
        }

        return () => {
            console.log("Unmount");
            socket.disconnect();
        }
    }, []);

    return (
        <div>
            <ReactEcharts
                notMerge={true}
                option={option}
                lazyUpdate={false}
            />
            <div className="down">
                <Card className="panel">
                    {/*{JSON.stringify(recent)}*/}
                    {recent.length !== 0 && recent.map(r => (
                        <ReportUnit record={r} handleReport={handleReport} />
                    ))}
                    {recent.length === 0 && (<Empty description="最近没有需要处理的举报"/>)}
                </Card>
                <Card className="panel">
                    <p>服务器地址：{cfg.base_url}</p>
                    {JSON.stringify(status)}
                {/*    CPU*/}
                {/*    RAM*/}
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignItems: "flex-start"
                    }}>
                        <p>内存占用</p>
                        <div className="total-ram">
                            <div className="used-ram" style={{width: `${ramUsage}%`}}/>
                        </div>
                    </div>

                </Card>
            </div>
        </div>
    );
}

export default Main;