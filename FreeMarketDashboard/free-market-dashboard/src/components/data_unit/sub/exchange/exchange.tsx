import React, {useEffect} from 'react';

import "../../common.scss";

function Exchange(props) {
    const { data } = props;

    useEffect(() => {console.log(data)}, []);

    return (
        <div>
            <div className="data">
                <p>交易ID：{data.exchange_id}</p>
                <p>卖家：{data.seller}</p>
                <p>买家：{data.buyer}</p>
                {/*<p>商品信息：</p>*/}
                {/*<div>*/}
                {/*    /!*{data.goods_snapshot.goods_name}*!/*/}
                {/*    /!*{data.goods_snapshot.price}*!/*/}
                {/*    {data.goods_snapshot}*/}
                {/*</div>*/}
                <p>实际支付：￥{data.price}</p>
                <p>交易日期：{new Date(data.post_date).toLocaleString()}</p>
                <p>备注：{data.desc}</p>
            </div>
        </div>
    );
}

export default Exchange;