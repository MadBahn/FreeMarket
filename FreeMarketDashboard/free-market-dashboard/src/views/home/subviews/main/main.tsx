import React, {useEffect, useState} from 'react';
import ReactEcharts from "echarts-for-react"
import {http} from "@tauri-apps/api";
import {Card} from "antd";

import "./main.scss";

function Main() {

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

    const [ option, setOption ] = useState(ops);

    const getOps = () => {
        return ops;
    }

    useEffect(() => {
    //    加载近段时间的数据

        const t = (async () => {
            return http.fetch("http://localhost:4000/api/admin/count", {
                method: "POST",
                body: http.Body.json({
                    admin_token: localStorage.getItem("token"),
                    time: {post_date: { $gt: new Date().getTime() - (60*60*24*30*1000)}},
                    isChart: true
                })
            }).then();
        });

        const a = (async () => {
            // @ts-ignore
            _source = (await t().then()).data.data;

            console.log(_source);
            setOption({...ops, dataset: {
                dimensions: ["name","条数"],
                source: _source
            }});
        })();
    }, []);

    return (
        <div>
            <ReactEcharts
                notMerge={true}
                option={option}
                lazyUpdate={false}
            />
            <div className="down">
                <Card>recent report</Card>
                <Card>status</Card>
            </div>
        </div>
    );
}

export default Main;