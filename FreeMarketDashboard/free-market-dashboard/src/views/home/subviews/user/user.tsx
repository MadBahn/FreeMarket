import React, { useState, useEffect } from 'react';
import {Button, Input, message, Table} from "antd";
import { LockOutlined, DeleteOutlined, StopOutlined, SearchOutlined } from "@ant-design/icons";
import {http} from "@tauri-apps/api";
import {confirm} from "@tauri-apps/api/dialog";
import {ColumnsType} from "antd/es/table";

import cfg from "@/common/cfg.json";

import "./user.scss";

function User() {
    const [ msgAPI, msgContext ] = message.useMessage();
    //前端自行整理用户或后端处理
    const [ userData, setUserData ] = useState([]);
    const [ loading, setLoading ] = useState(false);

    const [ filter, setFilter ] = useState({username: ""});

    const queryIndex = 0;

    const columns : ColumnsType<any> = [
        {
            title: "头像",
            render: (r) =>
                <div
                    className="avatar"
                    style={{backgroundImage: `url(${cfg.base_url}${r.headImg})`}}
                />,
            width: "5%"

        },
        {
            title: "用户id",
            dataIndex: "userid",
            key: "userid",
            width: "30%"
        },
        {
            title: "用户名",
            dataIndex: "username",
            key: "username",
            filterMode: "tree",
            filterSearch: true,
            onFilter: (v, r) => r.username.has(v)
        },
        {
            title: "状态",
            width: "10%",
            render: (r) => <p>{r.status ? "被封禁" : "正常"}</p>
        },
        {
            title: "操作",
            render: (_, record) => <div>
                <Button
                    icon={<LockOutlined />}
                    onClick={() => lockUser(record.userid)}
                >
                    { !record.isDel ? "锁定" : "解锁" }
                </Button>
                <Button
                    icon={<StopOutlined />}
                    onClick={() => blackUser(record.userid, record.status)}
                >
                    {record.status ? "解封" : "封禁"}
                </Button>
                <Button
                    icon={<DeleteOutlined />}
                    onClick={() => delUser(record.userid)}
                    type="primary"
                    danger
                >
                    删除
                </Button>
            </div>
        }
    ];

    useEffect(() => {
    //    加载用户数据
        request();
    }, []);

    const request = () => {
        setLoading(true);
        http.fetch(`${cfg.base_url}api/admin/user_list`, {
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token"),
                filter: filter
            })
        }).then(r => {
            // console.log(r);
            if(r.status === 200) {
                // console.log(r.data);
                //@ts-ignore
                setUserData(r.data);
                setLoading(false);
                console.log(r.data);
            }
        });
    //    加工数据


    //    对比
    }

    const blackUser = async (u: string, s: boolean) => {
        console.log(u, s);
        const url = s ? "remove" : "add"

        if(await confirm("是否继续", {
            title: "确认",
            type: "info"
        })) {
            await http.fetch(`${cfg.base_url}api/admin/${url}_blacklist`, {
                method: "POST",
                body: http.Body.json({
                    token: localStorage.getItem("token"),
                    target: u
                })
            }).then( r => {
                if(r.status === 200) {
                    msgAPI.open({
                        type: "success",
                        content: ""
                    });
                    request();
                }
            });
        }
    };

    const lockUser = async (u: string) => {
        // console.log(u);
        if(await confirm("是否继续", {
            title: "确认",
            type: "info"
        })) {
            await http.fetch(`${cfg.base_url}api/admin/lock`, {
                method: "POST",
                body: http.Body.json({
                    token: localStorage.getItem("token"),
                    target: u,
                    filter: {userid: u}
                })
            }).then(async r => {
                if(r.status === 200) { // @ts-ignore
                    request();
                } else {
                    msgAPI.open({
                        type: "error",
                        content: "加载失败"
                    });
                }
            });
        }
    };

    const delUser = async (u: string) => {
        // console.log(u);
        if(await confirm("此操作为高危操作，是否继续？", {
            title: "警告",
            type: "warning"
        })) {
            await http.fetch(`${cfg.base_url}api/admin/remove_complete`, {
                method: "POST",
                body: http.Body.json({
                    token: localStorage.getItem("token"),
                    target: u
                })
            }).then(async r => {
                if(r.status === 200) { // @ts-ignore
                    request();
                }
            });
        }
    };

    // @ts-ignore
    return (
        <div>
            <div className="query_form">
                <Input
                    placeholder="用户名"
                    onChange={(e) =>
                        setFilter({username: e.target.value})
                    }
                />
                <Button
                    icon={<SearchOutlined />}
                    type="primary"
                    onClick={() => {
                        console.log(filter)
                        request()
                    }}
                >
                    检索
                </Button>
            </div>
            <Table
                dataSource={userData}
                columns={//@ts-ignore
                    columns}
                loading={loading}
                pagination={{
                    hideOnSinglePage: true,
                    defaultPageSize: 6
                }}
            />
        </div>
    );
}

export default User;