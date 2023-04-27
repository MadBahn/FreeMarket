import React from 'react';
import {Button, Empty, Result} from "antd";
import {useNavigate} from "react-router-dom";

function Error(props) {
    const navigate = useNavigate();
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Result
                status="error"
                title="出错了"
                subTitle="程序出了一点问题"
                extra={[
                    <Button
                        onClick={() =>
                            navigate("/main")
                        }
                        type="primary"
                    >
                        重新加载
                    </Button>
                ]}
            />
        </div>
    );
}

export default Error;