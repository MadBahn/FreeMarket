import React, { useState, useEffect } from 'react';
import {Button, Table} from "antd";
import {http} from "@tauri-apps/api";

import cfg from "@/common/cfg.json";

import "./user.scss";
import {confirm} from "@tauri-apps/api/dialog";

function User() {
    //前端自行整理用户或后端处理
    const [ userData, setUserData ] = useState([]);
    const [ loading, setLoading ] = useState(false);

    const queryIndex = 0;

    const columns = [
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
            title: "id",
            dataIndex: "userid",
            key: "userid",
            width: "30%"
        },
        {
            title: "用户名",
            dataIndex: "username",
            key: "username",
            filter: [],
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
                    onClick={() => lockUser(record.userid)}
                >
                    { !record.isDel ? "锁定" : "解锁" }
                </Button>
                <Button
                    onClick={() => blackUser(record.userid, record.status)}
                >
                    {record.status ? "解封" : "封禁"}
                </Button>
                <Button
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
                token: localStorage.getItem("token")
            })
        }).then(r => {
            // console.log(r);
            if(r.status === 200) {
                // console.log(r.data);
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

    return (
        <div>
            <Table
                dataSource={userData}
                columns={columns}
                loading={loading}
                pagination={{
                    hideOnSinglePage: true,
                    defaultPageSize: 4
                }}
            />
        </div>
    );
}

export default User;