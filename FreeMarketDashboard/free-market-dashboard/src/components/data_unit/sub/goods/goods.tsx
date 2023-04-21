import React, {useEffect} from 'react';
import {Image} from "antd";

import cfg from "@/common/cfg.json";

import "../../common.scss";

function Goods(props) {
    const { data } = props;
    // const { username } = data.owner;
    useEffect(() => {console.log(data)}, []);

    return (
        <div>
            <div className="data">
                <p>商品ID：{data.goods_id ? data.goods_id : "None"}</p>
                <p>商品名称：{data.goods_name}</p>
                <p>商品拥有者：{data.owner}</p>
                <p>价格：￥{data.price}</p>
                <p>描述：{data.desc}</p>
                <p>状态：{data.status}</p>
                <p>发布日期：{new Date(data.post_date).toLocaleString()}</p>
            </div>
            <Image.PreviewGroup>
                {data.imgs && data.imgs.map(i =>
                    <Image
                        className="img_unit"
                        height="15vw"
                        width="15vw"
                        src={`${cfg.base_url}${i.url}`}
                    />
                )}
            </Image.PreviewGroup>
        </div>
    );
}

export default Goods;