import React from 'react';
import {Button} from "antd";

import Goods from "@/components/data_unit/sub/goods/goods";
import Post from "@/components/data_unit/sub/post/post";
import Exchange from "@/components/data_unit/sub/exchange/exchange";
import Comment from "@/components/data_unit/sub/comment/comment";

import cfg from "@/common/cfg.json";

import "./report_unit.scss";

function ReportUnit(props: any) {
    const { record } = props;

    const handleReport = (type, r, i) => {
        props.handleReport(type, r, i);
    }
    return (
        <div className="report_frame">
            <div className="report_by_info">
                <div
                    className="avatar"
                    style={{backgroundImage: `url(${cfg.base_url}${record.report_by.headImg})`}}/>
                <h2>{record.report_by.username}</h2>
            </div>
            <p>{new Date(record.post_date).toLocaleString()}</p>
            {record.refer_to.split(":")[0] === "goods" && <Goods data={record.refer_to_obj} />}
            {record.refer_to.split(":")[0] === "post" && <Post data={record.refer_to_obj} />}
            {record.refer_to.split(":")[0] === "exchange" && <Exchange data={record.refer_to_obj} />}
            {record.refer_to.split(":")[0] === "comment" && <Comment data={record.refer_to_obj} />}
            {!record.isDone ?
                <div style={{ marginTop: "1.5vh" }}>
                    <Button
                        className="btn"
                        onClick={() => handleReport(true, record.report_id, record.refer_to)}>处理</Button>
                    <Button
                        className="btn"
                        onClick={() => handleReport(false, record.report_id, record.refer_to)}>否决</Button>
                </div> : <div>done</div>}
        </div>
    );
}

export default ReportUnit;