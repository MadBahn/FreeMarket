import { http } from "@tauri-apps/api";

import cfg from "@/common/cfg.json";

export const verify = {
    doVerify: async () => {

        console.log("verifying");
    //    请求
        const isValid = (await http.fetch(`${cfg.base_url}api/admin/verify`,{
            method: "POST",
            body: http.Body.json({
                token: localStorage.getItem("token")
            })
        }).then((res) => {
            if(res.status === 200) return res.data;
            return false;
        }));
    //    当data为false时，清除localStorage()
        if(!isValid) localStorage.removeItem("token");
        return isValid;
    },
    logout: () => {

    }
};