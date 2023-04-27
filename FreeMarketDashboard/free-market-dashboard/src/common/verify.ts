import { http } from "@tauri-apps/api";

import cfg from "@/common/cfg.json";

export const verify = {
    doVerify: async () => {

        console.log(localStorage.getItem("token"));
    //    请求
        const token = localStorage.getItem("token");
        if(token) {
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
            console.log(isValid);
            if(!isValid) localStorage.removeItem("token");
            return isValid;
        } else {
            return false;
        }
    },
    logout: () => {

    }
};