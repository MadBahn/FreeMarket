import React, { useEffect, useState } from 'react';
import {Button, DatePicker, message, Segmented, Table} from "antd";
import {SearchOutlined} from "@ant-design/icons";

import { CustomIcon } from "@/components/custom_icon/custom_icon";
import { http } from "@tauri-apps/api";

import DataUnit from "@/components/data_unit/data_unit";

import cfg from "@/common/cfg.json";
import {ColumnsType} from "antd/es/table";

import "./data.scss";

const { RangePicker } = DatePicker;

function Data(){
    const [ msgAPI, msgContext ] = message.useMessage();

    const [ expandKey, setExpandKey ] = useState();
    const [ data, setData ] = useState([]);
    const [ option, setOption ] = useState("goods");
    const [ loading, setLoading ] = useState(false);

    const [ dateField, setDateField ] = useState({});

    // let expandData: any[] = [];

    const columns : ColumnsType<any> = [{
        title: "数据id",
        width: "30%",
        key: "id",
        render: (r) => <span>
            {option === "goods" ? <p>{r.goods_id}</p> :
            option === "post" ? <p>{r.post_id}</p> :
            option === "comment" ? <p>{r.comment_id}</p> :
            <p>{r.exchange_id}</p>}
        </span>

    },{
        title: "发布日期",
        dataIndex: "post_date",
        key: "post_date",
        width: "20%",
        defaultSortOrder: "descend",
        sorter: (a, b) => new Date(a.post_date).getTime() - new Date(b.post_date).getTime(),
        render: (r) => <p>{new Date(r).toLocaleString()}</p>
    },{
        title: "创建者",
        key: "creator",
        render: (r) => <p>
            {option === "goods" ? <p>{r.owner}</p> :
            option === "post" ? <p>{r.post_by}</p> :
            option === "comment" ? <p>{r.comment_by}</p> :
            <p>{r.buyer}</p>}
        </p>
    }];
    /*
    * 商品
    * 帖子
    * 评论
    * 交易
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

    // @ts-ignore
    const setCountIndex = () : number => {
      switch (option) {
          case "goods": return d_count.goods;
          case "post": return d_count.post;
          case "exchange": return d_count.exchange;
          case "comment": return d_count.comment;
      }
    }

    useEffect(() => {
        //获取总数据
        async function Do() {
            await http.fetch(`${cfg.base_url}api/admin/count`, {
                method: "POST",
                body: http.Body.json({
                    token: localStorage.getItem("token"),
                    time: {},
                    isChart: false
                })
            }).then(r => {
                // console.log(`${JSON.stringify(r.data)}`);
                if(r.status === 200) {
                    console.log(r.data);
                    // @ts-ignore
                    setD_count(r.data);
                }
            });

            // @ts-ignore
            await request(option);
        }
        Do().then();

        console.log(data);
    },[]);

    useEffect(() => {
        console.log(option)

        console.log("set",setCountIndex());

        async function Do() {
            // @ts-ignore
            await request(option);
        }
        Do().then();
    }, [option])

    //锁定/解锁
    const lock = async (e) => {
        console.log(e);
        const query = (() => {
            switch (e.split(":")[0]) {
                case "goods": return {goods_id: e};
                case "post": return {post_id: e};
                case "exchange": return {exchange_id: e};
                case "comment": return {comment_id: e};
            }
        })();
    //    请求锁定/解锁
        await http.fetch(`${cfg.base_url}api/admin/lock`, {
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token"),
                target: e,
                filter: query
            })
        }).then(async r => {
            if(r.status === 200) {
                await request(option);
                msgAPI.open({
                    type: "success",
                    content: `${e.isDel ? "解锁" : "锁定"}成功`
                });
            }
        });
    };
    //彻底删除
    const delete_data = async (e) => {
        console.log(e);
    //    请求彻底删除
        await http.fetch(`${cfg.base_url}api/admin/remove_complete`, {
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token"),
                target: e
            })
        }).then(async r => {
            if(r.status === 200) {
                msgAPI.open({
                    type: "success",
                    content: "删除成功"
                });
                // @ts-ignore
                await request(option);
            }
        });

    }

    const request = (model: string, filter: object = {}) => {
        setData([]);
        setLoading(true);
        http.fetch(`${cfg.base_url}api/admin/data_admin`, {
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token"),
                query: {
                    model: model,
                    filter: filter,
                    field: {start:0,limit:0}
                }
            })
        }).then(r=>{
            if(r.status === 200) {
                setLoading(false);
                //@ts-ignore
                setData(r.data.data.map(i => ({
                        ...i,
                        key: i._id
                    }))
                );
            } else {
                msgAPI.open({
                    type: "error",
                    content: "加载失败"
                });
            }
        });
    };

    const changeRange = (e) => {
        if(e)
            setDateField({
                $gt: new Date(e[0].$d),
                $lt: new Date(e[1].$d)
            });
        else setDateField({});
    }

    const doQuery = () => {
        const f = {};
        // @ts-ignore
        if(Object.keys(dateField).length !== 0) f.post_date = dateField;
        request(option, f);
    }

    // @ts-ignore
    return (
        <div>
            <div className="query_form">
                <Segmented
                    options={options}
                    onChange={//@ts-ignore
                        (e) => setOption(e)}
                />
                <RangePicker onChange={changeRange}/>
                <Button
                    icon={<SearchOutlined />}
                    type="primary"
                    onClick={doQuery}
                >
                    检索
                </Button>
            </div>
            <Table
                columns={//@ts-ignore
                    columns}
                loading={loading}
                pagination={{
                    hideOnSinglePage: true,
                    defaultPageSize: 8
                }}
                scroll={{ y: "65vh" }}
                expandable={{
                    expandedRowKeys: expandKey,
                    rowExpandable: (r) => true,
                    expandedRowRender: (r) =>
                        <DataUnit
                            source={r}
                            _type={option}
                            onLock={lock}
                            onDelete={delete_data}
                        />,
                    onExpand: (e, r) => {
                        const keys = [];
                        if(e) keys.push(r._id);
                        console.log(e, r, keys);
                        //@ts-ignore
                        setExpandKey(keys);
                    }
                }}
                dataSource={data}
            />
        </div>
    );
}

export default Data;