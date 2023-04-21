import React, { useEffect, useState } from 'react';
import {Button} from "antd";
import {http} from "@tauri-apps/api";
import {useNavigate} from "react-router-dom";

import {verify} from "@/common/verify";

import cfg from "@/common/cfg.json";
import {confirm} from "@tauri-apps/api/dialog";


function Info() {
    const [info, setInfo] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
    //    返回处理器、内存、系统等信息
        http.fetch(`${cfg.base_url}api/admin/server_info`, {
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token")
            })
        }).then(r => {
            console.log(r);
            if(r.status === 200) setInfo(r.data);
        })
    }, []);

    //注销
    const logout = async () => {
        if(await confirm("是否注销？", {
            title: "确认",
            type: "info"
        })) {
            http.fetch(`${cfg.base_url}api/admin/logout`, {
                method: "POST",
                body: http.Body.json({
                    token: localStorage.getItem("token")
                })
            }).then(async r => {
                if(r.status === 200) {
                    localStorage.removeItem("token");

                    const isValid = await verify.doVerify();
                    !isValid && navigate("/login");
                }
            });
        }
    };

    return (
        <div>
            {/*当前服务器的配置信息*/}
            <div>
                {/*{ JSON.stringify(info) }*/}
                <p>
                    {/*bug*/}
                    <h3>CPU</h3>
                    {/*<p>型号：{info.CPU.model || ""}</p>*/}
                    {/*<p>架构：{info.CPU.arch || ""}</p>*/}
                    {/*<p>频率：{info.CPU.frequency || ""}</p>*/}
                </p>
                <p>
                    {/*bug*/}
                    <h3>系统</h3>
                    {/*<p>版本：{info.OS.version}</p>*/}
                    {/*<p>类型：{info.OS.type}</p>*/}
                </p>
                <p>
                    <h3>内存</h3>
                    <p>{info.RAM}</p>
                </p>
            </div>
            <Button onClick={logout} type="primary" danger>注销当前账号</Button>
        </div>
    );
}

export default Info;