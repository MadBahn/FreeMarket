import React, { useState, useEffect } from 'react';
import { Button } from "antd";
import { LockOutlined, DeleteOutlined } from "@ant-design/icons";
import { confirm } from "@tauri-apps/api/dialog";

import Goods from "@/components/data_unit/sub/goods/goods";
import Post from "@/components/data_unit/sub/post/post";
import Exchange from "@/components/data_unit/sub/exchange/exchange";
import Comment from "@/components/data_unit/sub/comment/comment";

import "./data_unit.scss";
// @ts-ignore
function DataUnit(props: any) {
    const data_list = props.source;
    const type = props._type;

    const idChooser = (d) => {
        switch(type) {
            case "goods": return d.goods_id;
            case "post": return d.post_id;
            case "exchange": return d.exchange_id;
            case "comment": return d.comment_id;
        }
    }

    const _Lock = async (e) => {
        const id = idChooser(e);

        if(await confirm("是否继续？", {
            title: "确认",
            type: "info"
        })) {
            props.onLock(id);
        }
    }

    const _Delete = async (e) => {
        const id = idChooser(e);

        if(await confirm("此操作不可逆，是否继续?",{
            title: "警告",
            type: "warning"
        })){
            props.onDelete(id);
        }
    }

    return (
        <div>
            {/*被锁定时显示锁图标*/}
            {data_list.isDel && <LockOutlined />}
            {type === "goods" && <Goods data={data_list} />}
            {type === "post" && <Post data={data_list} />}
            {type === "exchange" && <Exchange data={data_list} />}
            {type === "comment" && <Comment data={data_list} />}
            <div style={{marginTop: "2vh"}}>
                <Button
                    icon={<LockOutlined />}
                    onClick={() => _Lock(data_list)}
                >
                    { !data_list.isDel ? "锁定":"解锁"}
                </Button>
                <Button
                    icon={<DeleteOutlined />}
                    type="primary"
                    onClick={() => _Delete(data_list)}
                    danger>
                    彻底删除
                </Button>
            </div>
        </div>
    );
}

export default DataUnit;