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
            //@ts-ignore
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

    // @ts-ignore
    return (
        <div>
            {/*当前服务器的配置信息*/}
            <div>
                <h2>当前服务器硬件</h2>
                <p>
                    <h3>CPU</h3>
                    {//@ts-ignore
                        info.CPU &&
                        <>
                            <p>型号：{//@ts-ignore
                                info.CPU.model}</p>
                            <p>架构：{//@ts-ignore
                                info.CPU.arch}</p>
                            <p>频率：{//@ts-ignore
                                info.CPU.frequency}MHz</p>
                        </>
                    }
                </p>
                <p>
                    <h3>系统</h3>
                    {//@ts-ignore
                        info.OS && (
                        <>
                            <p>版本：{//@ts-ignore
                                info.OS.version}</p>
                            <p>类型：{//@ts-ignore
                                info.OS.type}</p>
                        </>
                    )}
                </p>
                <p>
                    <h3>内存</h3>
                    <p>容量：{//@ts-ignore
                        info.RAM}</p>
                </p>
                <h2>服务器</h2>
                <p>
                    {//@ts-ignore
                        info.Server && <p>
                        <p>服务器名称：{//@ts-ignore
                            info.Server.name}</p>
                        <p>服务器版本：{//@ts-ignore
                            info.Server.version}</p>
                    </p>}
                </p>
            </div>
            <Button onClick={logout} type="primary" danger>注销当前账号</Button>
        </div>
    );
}

export default Info;