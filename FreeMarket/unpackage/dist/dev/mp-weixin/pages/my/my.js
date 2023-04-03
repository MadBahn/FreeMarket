"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my",
  setup(__props) {
    const isLogin = common_vendor.ref(false);
    const info = common_vendor.ref({});
    const action = common_vendor.ref();
    common_vendor.onLoad(async () => {
      getInfo();
      if (Object.keys(info.value).length !== 0)
        ;
    });
    common_vendor.index.$on("user", () => getInfo());
    common_vendor.index.$on("logout", () => logout());
    function getInfo() {
      try {
        info.value = getApp().globalData.login;
        console.log(info.value);
        isLogin.value = Object.keys(info.value).length !== 0;
      } catch (e) {
      }
    }
    function goto(url) {
      common_vendor.index.navigateTo({
        url
      });
    }
    function editAvatar() {
      action.value.open("bottom");
    }
    function selecctImage(from) {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: from,
        success(res) {
          console.log(res);
          common_vendor.index.uploadFile({
            url: `${cfg.cfg.server}:${cfg.cfg.port}${cfg.cfg.api.prefix}${cfg.cfg.api.files.prefix}${cfg.cfg.api.files.upload_file}`,
            filePath: res.tempFilePaths[0],
            name: "file",
            success(_res) {
              console.log(_res);
              if (_res.statusCode === 200) {
                const url_t = JSON.parse(_res.data)[0].path.split("\\");
                const url = "files\\\\".concat(url_t[1]);
                common_vendor.index.request({
                  url: `${cfg.cfg.server}:${cfg.cfg.port}${cfg.cfg.api.prefix}${cfg.cfg.api.user.prefix}${cfg.cfg.api.user.modify_info}`,
                  method: "POST",
                  data: {
                    modify_form: {
                      userid: getApp().globalData.login.userid,
                      headImg: url
                    }
                  },
                  success(__res) {
                    console.log(__res);
                    if (__res.statusCode === 200) {
                      getApp().globalData.login.headImg = url;
                      common_vendor.index.setStorage({
                        key: "user_login",
                        data: __res.data,
                        complete() {
                          info.value = {};
                          getInfo();
                          action.value.close();
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        }
      });
    }
    function logout() {
      try {
        common_vendor.index.removeStorage({
          key: "user_login",
          success() {
            getApp().globalData.login = {};
            isLogin.value = false;
            getInfo();
          }
        });
      } catch (e) {
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: `url(` + (info.value.headImg !== "" ? common_vendor.unref(cfg.cfg).server + ":" + common_vendor.unref(cfg.cfg).port + "/" + info.value.headImg : common_vendor.unref(cfg.cfg).default_avatar) + `)`,
        b: common_vendor.o(editAvatar),
        c: isLogin.value
      }, isLogin.value ? {
        d: common_vendor.t(info.value.username),
        e: common_vendor.t(info.value.desc),
        f: common_vendor.o(($event) => goto(`/pages/edit_info/edit_info`))
      } : {
        g: common_vendor.o(($event) => goto(`/pages/login/login`))
      }, {
        h: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-favor"
        }),
        i: common_vendor.o(($event) => goto(`/pages/favorite/favorite`)),
        j: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-lishi"
        }),
        k: common_vendor.o(($event) => goto(`/pages/history/history`)),
        l: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-tiezi"
        }),
        m: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-31quanbushangpin"
        }),
        n: common_vendor.o(($event) => goto(`/pages/mygoods/mygoods`)),
        o: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-mairu"
        }),
        p: common_vendor.o(($event) => goto(`/pages/exchange/exchange?type=buyer`)),
        q: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-maichu"
        }),
        r: common_vendor.o(($event) => goto(`/pages/exchange/exchange?type=seller`)),
        s: common_vendor.o(($event) => goto(`/pages/settings/settings`)),
        t: common_vendor.p({
          type: "camera-filled",
          size: "25"
        }),
        v: common_vendor.o(($event) => selecctImage(["camera"])),
        w: common_vendor.p({
          type: "image-filled",
          size: "25"
        }),
        x: common_vendor.o(($event) => selecctImage(["album"])),
        y: common_vendor.sr(action, "2f1ef635-6", {
          "k": "action"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/my/my.vue"]]);
wx.createPage(MiniProgramPage);
