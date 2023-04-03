import React, { useEffect, useState } from 'react';
import {Button, List, Pagination, Segmented} from "antd";

import { CustomIcon } from "../../../../components/custom_icon/custom_icon";
import { http } from "@tauri-apps/api";
import DataUnit from "../../../../components/data_unit/data_unit";

function Data(){
    const [data, setData] = useState([]);
    const [option, setOption] = useState("goods");
    const [field, setField] = useState({
        start: 0,
        limit: 5
    });

    let total = 0;

    let queryIndex = 0;

    /*
    * 商品
    * 帖子
    * 评论
    * 交易
    * 历史
    * */

    const options = [
        {label: "商品", value: "goods", icon: <CustomIcon type="icon-shangpin"/>},
        {label: "帖子", value: "post", icon: <CustomIcon type="icon-icon_wenzhang" />},
        {label: "交易", value: "exchange", icon: <CustomIcon type="icon-jiaoyi" />},
        {label: "评论", value: "comment", icon: <CustomIcon type="icon-pinglun-08" />},
    ];

    //数据条数
    const [d_count, setD_count] = useState({
        goods: 0,
        post: 0,
        exchange: 0,
        comment: 0
    })

    const setCountIndex = () : number => {
      switch (option) {
          case "goods": return d_count.goods;
          case "post": return d_count.post;
          case "exchange": return d_count.exchange;
          case "comment": return d_count.comment;
      }
    }

    useEffect(() => {
        // setData(await request());

        //获取总数据
        async function Do() {
            await http.fetch("http://localhost:4000/api/admin/count", {
                method: "POST",
                body: http.Body.json({
                    admin_token: localStorage.getItem("token"),
                    time: {},
                    isChart: false
                })
            }).then(r => {
                console.log(`${JSON.stringify(r.data)}`);
                if(r.status === 200) {
                    // console.log(r.data.data[0])
                    setD_count(r.data)
                }
            });

            // @ts-ignore
            setData((await request(option).then()).data.data);
        }
        Do().then();

        console.log(data);
    },[]);

    useEffect(() => {
        console.log(option)


        console.log("set",setCountIndex());

        // setTotal(setCountIndex());

        total = setCountIndex();

        async function Do() {
            // @ts-ignore
            setData((await request(option).then()).data.data);
        }
        Do().then();
    }, [option])

    const req_count = () => {

    }
    //传入自适应字段，以第一条数据为准
    const custom_key = () => {

    }
    //锁定/解锁
    const lock = (e) => {
        console.log(e);
    }
    //彻底删除
    const delete_data = (e) => {
        console.log(e);
    }

    const request = (model: string) => {
        return http.fetch("http://localhost:4000/api/admin/data_admin", {
            method: "POST",
            body: http.Body.json({
                admin_token: localStorage.getItem("token"),
                query: {
                    model: model,
                    filter: {},
                    field: field
                }
            })
        }).then();
    };

    return (
        <div>
            <Segmented
                options={options}
                onChange={(e) => setOption(e)}
            />
            <List
                style={
                    {
                        height: "80vh",
                        overflowY: "scroll"
                    }
                }
                itemLayout="vertical"
                size="large"
                dataSource={data}
                renderItem={(i) => (
                    //@ts-ignore
                    <List.Item id={i._id}>
                        {/*以下划线为分割符，长度为二*/}
                        {/*{}*/}
                        <DataUnit source={i} onLock={lock}/>

                    </List.Item>
                )}
            />
            <Pagination total={total}/>
        </div>
    );
}

export default Data;