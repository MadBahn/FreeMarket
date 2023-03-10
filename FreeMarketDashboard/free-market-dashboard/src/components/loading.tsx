import React from 'react';

import { LoadingOutlined } from "@ant-design/icons";
import {Spin} from "antd";

export default function Loading() {

    //自定义加载图标
    const loadIcon = <LoadingOutlined style={{ fontSize: "8vw"}} spin/>

    return (
        <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <Spin
                indicator={loadIcon}
                tip="loading"
                style={{ fontSize: "2vw" }}/>
        </div>
    );
}