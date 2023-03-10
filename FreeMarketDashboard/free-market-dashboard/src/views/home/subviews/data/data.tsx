import React, { useEffect, useState } from 'react';
import { Drawer, List, Segmented } from "antd";

import { CustomIcon } from "../../../../components/custom_icon";
import { http } from "@tauri-apps/api";

function Data(){
    const [data, setData] = useState([]);

    /*
    * 商品
    * 帖子
    * 评论
    * 交易
    * 历史
    * */

    const options = [
        {label: "商品", value: "商品", icon: <CustomIcon type="icon-shangpin"/>},
        {label: "帖子", value: "帖子", icon: <CustomIcon type="icon-icon_wenzhang" />},
        {label: "交易", value: "交易", icon: <CustomIcon type="icon-jiaoyi" />},
        {label: "评论", value: "评论", icon: <CustomIcon type="icon-pinglun-08" />},
    ];

    useEffect(() => {
        // setData(await request());
        async function Do() {
            // console.log((await request().then()).data.data);
            // @ts-ignore
            setData((await request().then()).data.data);
        }
        Do().then();

        console.log(data);
    },[]);

    const request = () => {
        return http.fetch("http://localhost:4000/api/goods/goods_display", {
            method: "POST",
            body: http.Body.json({
                filter: {}
            })
        }).then();
    };

    return (
        <div>
            <Segmented options={options}/>
            <List
                itemLayout="vertical"
                size="large"
                dataSource={data}
                renderItem={(i) => (
                    //@ts-ignore
                    <List.Item id={i._id}>
                        {JSON.stringify(i)}
                    </List.Item>
                )}
            />
            <Drawer title="详情" placement="right">

            </Drawer>
        </div>
    );
}

export default Data;