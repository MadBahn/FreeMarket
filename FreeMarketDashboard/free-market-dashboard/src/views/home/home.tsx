import React, { useEffect, useState } from 'react';
import { Layout, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { useNavigate, Outlet } from "react-router-dom";
import { Footer, Header } from "antd/es/layout/layout";
import { HomeOutlined,
    DatabaseOutlined,
    ExclamationCircleOutlined,
    InfoOutlined } from "@ant-design/icons";
import { getTauriVersion } from "@tauri-apps/api/app";


import { verify } from "../../common/verify";

import "./home.css";

function Home() {
    /*
    componentDidMount的替换：useEffect(callback, []);
    仅effect中选择的参数更新时才会执行指定的effect
    */

    const [ key, setKey ] = useState("main");
    const [ label, setLabel ] = useState("首页");
    const [ ver, setVer ] = useState("");

    const navigate = useNavigate();

    const menu_items = [
        {label: "首页", key: "main", icon: <HomeOutlined />},
        {label: "数据", key: "data", icon: <DatabaseOutlined />},
        {label: "举报", key: "report", icon: <ExclamationCircleOutlined />},
        {label: "关于", key: "info", icon: <InfoOutlined />},
    ];

    //等价于componentDidMount生命周期钩子
    useEffect(() => {
        async function Do(){
          setVer((await getTauriVersion().then()));
        }
        Do().then();
    }, []);

    useEffect(() => {
        // console.log((getTauriVersion().then()));
        verifyToken().then();
        // const t_ver = async function(){
        //     return await getTauriVersion().then();
        // }();
        // setVer(t_ver.then());
    });

    const verifyToken = async () => {
        const isValid = await verify.doVerify();
        !isValid && navigate("/login");
    };

    const doSelect = (e : object) => {
        // @ts-ignore
        setKey(e.key);
        // @ts-ignore
        setLabel(menu_items.find(i => i.key === e.key).label);
        // @ts-ignore
        navigate("/" + e.key);
    }

    return (
        <Layout className="main">
            <Sider
                className="sider"
                breakpoint="lg"
                collapsedWidth="0"
            >
                <h1>a</h1>
                <Menu
                    items={menu_items}
                    theme="dark"
                    defaultSelectedKeys={["main"]}
                    onSelect={(e) => doSelect(e)}
                />
            </Sider>
            <Layout>
                <Header
                    className="header"
                    style={{
                        backgroundColor: "white",
                        padding: "0 1vw"
                    }}
                >
                    当前页面：{label}
                </Header>
                <div className="content">
                    <Outlet/>
                </div>
                <Footer style={{padding: "1vh 1vw"}}>
                    Powered by Tauri {ver}
                </Footer>
            </Layout>
        </Layout>
    );
}

export default Home;