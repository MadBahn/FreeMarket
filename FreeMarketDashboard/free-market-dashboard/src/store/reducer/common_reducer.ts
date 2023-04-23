import {createSlice} from "@reduxjs/toolkit";
import {http} from "@tauri-apps/api";

import cfg from "@/common/cfg.json";

const commonSlice = createSlice({
    name: "common",
    initialState: {
        data_count: {},
        server_info: {}
    },
    reducers: {
        init: (state) => {
            //数据条数
            http.fetch(`${cfg.base_url}api/admin/count`, {
                method: "POST",
                body: http.Body.json({
                    token: localStorage.getItem("token"),
                    time: {post_date: { $gt: new Date().getTime() - (60*60*24*30*1000)}},
                    isChart: true
                })
            }).then(r => {
                console.log(r);
                //@ts-ignore
                if(r.status === 200) state.data_count = r.data.data;
                console.log(state.data_count);
            });
            //服务器信息
            http.fetch(`${cfg.base_url}api/admin/server_info`, {
                method: "POST",
                body: http.Body.json({
                    token: localStorage.getItem("token")
                })
            }).then(r => {
                if(r.status === 200) state.server_info = r.data;
            });
        }
    }
});

//export actions
export const { init } = commonSlice.actions;
//export reducer
export default commonSlice.reducer;