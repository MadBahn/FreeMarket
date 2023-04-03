import React, { useState, useEffect } from 'react';
import {Pagination, Table} from "antd";

function User() {
    //前端自行整理用户或后端处理
    const [ userData, setUserData ] = useState([])

    const queryIndex = 0;

    const columns = [
        {
            title: "id",
            dataIndex: "userid",
            key: "userid"
        },
        {
            title: "用户名",
            dataIndex: "username",
            key: "username"
        },
        {
            title: "状态"
        },
        {
            title: "操作"
        }
    ]

    return (
        <div>
            <Table columns={columns}/>
            <Pagination />
        </div>
    );
}

export default User;