import React, {useState, useEffect, useRef} from 'react';
import {http} from "@tauri-apps/api";
import {Button, Input, Table} from "antd";
import {SearchOutlined} from "@ant-design/icons";

import cfg from "@/common/cfg.json";
import {confirm} from "@tauri-apps/api/dialog";

import ReportUnit from "@/components/report_unit/report_unit";

import "./report.scss";
import {ColumnsType} from "antd/es/table";

function Report() {
    // 举报数据
    const [ data, setData ] = useState([]);

    const [ expandKey, setExpandKey ] = useState();

    const [ loading, setLoading ] = useState(false);

    const [search, setSearch] = useState("");
    const [column, setColumn] = useState("");
    const searchInput = useRef(null);

    const doSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearch(selectedKeys[0]);
        setColumn(dataIndex);
    }

    const columns : ColumnsType<any> = [
        {
            title: "举报者",
            dataIndex: "report_by",
            render: (r) => <p>{r.username || r.userid}</p>
        },
        {
            title: "原因",
            render: (r) =>
                <div>
                    {`${r.reason}${r.other_reason ? `: ${r.other_reason}`: ''} `}
                </div>
        },
        {
            title: "举报时间",
            defaultSortOrder: "descend",
            sorter: (a, b) => new Date(a.post_date).getTime() - new Date(b.post_date).getTime(),
            render: (r) =>
                <div>{new Date(r.post_date).toLocaleString()}</div>
        }
    ]

    useEffect(() => {
        request();
        console.log(columns);
    },[]);

    const request = () => {
        setLoading(true);
        http.fetch(`${cfg.base_url}api/admin/get_report`,{
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token"),
                isRecent: false
            })
        }).then(r => {
            if(r.status === 200) {
                setLoading(false);
                // @ts-ignore
                setData(r.data.map(i => ({
                    ...i,
                    key: i._id
                })));
            }
        });
    }
    const handleReport = async (type, r, i) => {
        console.log(i);
        if(await confirm("是否继续？", {
            title: "确认",
            type: "info"
        })) {
            http.fetch(`${cfg.base_url}api/admin/handle_report`, {
                method: "POST",
                body: http.Body.json({
                    token: localStorage.getItem("token"),
                    type: type,
                    report: r,
                    target: i
                })
            }).then(r => {
                console.log(r);
                if(r.status === 200) {
                    request();
                }
            });
        }
    };

    return (
        <div>
            <Table
                className="report"
                dataSource={data}
                loading={loading}
                columns={//@ts-ignore
                    columns}
                pagination={{
                    hideOnSinglePage: true,
                    defaultPageSize: 4
                }}
                expandable={{
                    expandedRowKeys: expandKey,
                    rowExpandable: (r) => true,
                    expandedRowRender: (record) =>
                        <ReportUnit record={record} handleReport={handleReport} />,
                    onExpand: (e, r) => {
                        const keys = [];
                        if(e) keys.push(r._id);
                        console.log(e, r, keys);
                        //@ts-ignore
                        setExpandKey(keys);
                    }
                }}
            />
        </div>
    );
}

export default Report;