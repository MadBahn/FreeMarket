import React, {useEffect} from 'react';
import {Image} from "antd";
import cfg from "@/common/cfg.json";

import "../../common.scss";

function Post(props) {
    const { data } = props;
    // const { username } = data.owner;
    useEffect(() => {console.log(data)}, []);

    return (
        <div>
            <div className="data">
                <p>帖子ID：{data.post_id}</p>
                <p>标题：{data.title}</p>
                <p>发帖者：{data.post_by}</p>
                <p>正文：{data.content}</p>
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

export default Post;