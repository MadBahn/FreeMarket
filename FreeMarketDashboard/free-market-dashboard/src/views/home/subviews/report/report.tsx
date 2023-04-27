import React, {useState, useEffect, useRef} from 'react';
import {http} from "@tauri-apps/api";
import {Button, DatePicker, Input, message, Select, Table} from "antd";
import {ColumnsType} from "antd/es/table";
import {SearchOutlined} from "@ant-design/icons";

const { RangePicker } = DatePicker;

import cfg from "@/common/cfg.json";
import {confirm} from "@tauri-apps/api/dialog";

import ReportUnit from "@/components/report_unit/report_unit";

import "./report.scss";


function Report() {
    const [ msgAPI, msgContext ] = message.useMessage();
    // 举报数据
    const [ data, setData ] = useState([]);

    const [ expandKey, setExpandKey ] = useState();

    const [ loading, setLoading ] = useState(false);

    const [ dateField, setDateField ] = useState({});
    const [ key, setKey ] = useState("");

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
    ];

    const request = (filter) => {
        console.log("request");
        setLoading(true);
        http.fetch(`${cfg.base_url}api/admin/get_report`,{
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token"),
                isRecent: false,
                filter: filter
            })
        }).then(r => {
            setLoading(false);
            if(r.status === 200) {
                // @ts-ignore
                setData(r.data.map(i => ({
                    ...i,
                    key: i._id
                })));
            } else {
                msgAPI.open({
                    type: "error",
                    content: "加载失败"
                });
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
                    request({});
                }
            });
        }
    };

    const changeRange = (e) => {
        console.log(e);
        if(e)
            setDateField({
                $gt: new Date(e[0].$d),
                $lt: new Date(e[1].$d)
            });
        else setDateField({});
    }

    //设置检索条件
    const doQuery = () => {
        const f = {};
        // @ts-ignore
        if(key !== "") f.other_reason = key;
        // @ts-ignore
        if(Object.keys(dateField).length !== 0) f.post_date = dateField;

        request(f);
    }

    useEffect(() => {
        request({});
        console.log(columns);
    },[]);

    return (
        <div>
            <div className="query_form">
                <Input
                    placeholder="举报原因（其他）"
                    onChange={(e) =>
                        setKey(e.target.value)
                    }
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
                dataSource={data}
                loading={loading}
                columns={//@ts-ignore
                    columns}
                pagination={{
                    hideOnSinglePage: true,
                    defaultPageSize: 8
                }}
                scroll={{ y: "65vh" }}
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