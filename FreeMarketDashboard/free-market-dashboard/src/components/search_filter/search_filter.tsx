import React from 'react';
import {Button, Input} from "antd";
import {SearchOutlined} from "@ant-design/icons";

function SearchFilter(props) {

    const getColumnSearchProps = (dataIndex) => ({
        filterDropDown: ({setSelectedKeys, selectedKeys, confirm}) => (
            <div>
                <Input
                    ref={searchInput}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => doSearch(selectedKeys, confirm, dataIndex)}
                />
                <Button
                    icon={<SearchOutlined />}
                    onClick={() => doSearch(selectedKeys, confirm, dataIndex)}
                >
                    检索
                </Button>
            </div>
        ),
        filterIcon: () => (
            // <SearchOutlined />
            <div>search</div>
        ),
        onFilter: (v, r) =>
            r[dataIndex].toString().toLowerCase().includes(v.toLowerCase()),
    });


    return (
        <div></div>
    );
}

export default SearchFilter;