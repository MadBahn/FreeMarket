import React, { useState, useEffect } from 'react';
import {Button, Image} from "antd";

import cfg from "../../common/cfg.json";


// @ts-ignore
function DataUnit(props: any, {onLock}) {
    const data_list = props.source;
    const imgs_render = props.source.imgs;

    const _Lock = (e) => {
        onLock(e);
    }

    const _Delete = (e) => {
        Delete(e);
    }

    //自适应显示数据
    for (let i in props.source) {
        // console.log(i)
        // console.log(props.source[i])
        if(i === "imgs") console.log("render imgs")
    }

    return (
        <div>
            {/*{JSON.stringify(props.source)}*/}
            {/*    imgs display if exist*/}
            {Object.keys(data_list).map(u =>
                (u !== "imgs" && u !== "__v" && u !== "_id" && u !== "isDel") && <p>
                    {u}:{JSON.stringify(props.source[u])}
                </p>
            )}
            <Image.PreviewGroup>
                {imgs_render && imgs_render.map(i =>
                    <Image
                        className="img_unit"
                        height="15vw"
                        width="15vw"
                        src={cfg.base_url + i.url}
                    />
                )}
            </Image.PreviewGroup>
            <div>
                <Button onClick={onLock}>锁定</Button>
                <Button type="primary" danger>彻底删除</Button>
            </div>
        </div>
    );
}

export default DataUnit;