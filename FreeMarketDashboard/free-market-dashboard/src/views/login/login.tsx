import {Button, Card, Input, message} from 'antd';
import React, { useEffect, useState} from 'react';
import { Navigate } from "react-router-dom";
import { http } from "@tauri-apps/api";

import { verify } from "../../common/verify";

import "./login.css";

function Login() {
    const [ msgAPI, msgContext ] = message.useMessage();

    //设置state，格式：[var, setter]
    const [ admin_name, setAdmin_name ] = useState("")
    const [ password, setPassword ] = useState("");
    const [ isValid, set_isValid ]= useState(false);

    //使用副作用，等价于componentDidMount生命周期
    useEffect(() => {
        verifyToken().then();
    },[]);

    // @ts-ignore
    const verifyToken = async () => set_isValid(await verify.doVerify());

    //执行登录请求
    const doLogin = async () => {
        await http.fetch("http://localhost:4000/api/admin/login",{
            method: "POST",
            body: http.Body.json({
                //登录信息
                admin_form: {
                    admin_name: admin_name,
                    password: password
                }
            })
        }).then((res) => {
            console.log(res);
            //登录成功
            if(res.status === 200){
                // @ts-ignore
                localStorage.setItem("token", res.data.token_id);
                msgAPI.open({
                    type: "success",
                    content: "登录成功"
                });
                verifyToken().then();
            } else {
                msgAPI.open({
                    type: "error",
                    content: "用户名或密码错误"
                });
            }
        })
    };

    const doEnterPress = () => {
        console.log("enter");


    }

    return (
        <div style={{
            backgroundColor: "lightblue",
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            {/*验证admin_token*/}
            {isValid && <Navigate to="/main" />}

            {msgContext}
            <Card className="login_box"
                  onKeyDownCapture={doEnterPress}>
                <Input
                    className="input"
                    placeholder="用户名"
                    value={admin_name}
                    onChange={(e) => setAdmin_name(e.target.value)}/>
                <Input.Password
                    className="input"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>
                <Button className="btn" onClick={doLogin}>登录</Button>
            </Card>
        </div>
    );
}

export default Login;