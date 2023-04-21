import React, {useEffect} from 'react';

import "../../common.scss";

function Comment(props) {
    const { data } = props;
    useEffect(() => {console.log(data)}, []);

    return (
        <div>
            <div className="data">
                <p>评论ID：{data.comment_id}</p>
                <p>评论者：{data.comment_by}</p>
                <p>评论内容：{data.content}</p>
                <p>评论对象：{data.comment_to}</p>
                <p>发布日期：{new Date(data.post_date).toLocaleString()}</p>
            </div>
        </div>
    );
}

export default Comment;