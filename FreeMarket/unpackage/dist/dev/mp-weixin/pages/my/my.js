"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my",
  setup(__props) {
    const isLogin = common_vendor.ref(false);
    const info = common_vendor.ref({});
    common_vendor.onLoad(async () => {
      getInfo();
      if (Object.keys(info.value).length !== 0)
        ;
    });
    common_vendor.index.$on("user", () => getInfo());
    function getInfo() {
      try {
        info.value = getApp().globalData.login;
        console.log(info.value);
        if (Object.keys(info.value).length !== 0)
          isLogin.value = true;
      } catch (e) {
      }
    }
    function goto(url) {
      common_vendor.index.navigateTo({
        url
      });
    }
    function gotoEditInfo() {
      common_vendor.index.navigateTo({
        url: "/pages/edit_info/edit_info"
      });
    }
    function logout() {
      try {
        common_vendor.index.removeStorage({
          key: "user_login",
          success() {
            getApp().globalData.login = {};
            isLogin.value = false;
          }
        });
      } catch (e) {
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: `url(` + info.value.headImg + `)`,
        b: common_vendor.o(gotoEditInfo),
        c: isLogin.value
      }, isLogin.value ? {
        d: common_vendor.t(info.value.username),
        e: common_vendor.t(info.value.desc)
      } : {
        f: common_vendor.o(($event) => goto(`/pages/login/login`))
      }, {
        g: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-favor"
        }),
        h: common_vendor.o(($event) => goto(`/pages/favorite/favorite`)),
        i: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-lishi"
        }),
        j: common_vendor.o(($event) => goto(`/pages/history/history`)),
        k: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-tiezi"
        }),
        l: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-31quanbushangpin"
        }),
        m: common_vendor.o(($event) => goto(`/pages/mygoods/mygoods`)),
        n: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-mairu"
        }),
        o: common_vendor.p({
          size: "35",
          customPrefix: "iconfont",
          type: "icon-maichu"
        }),
        p: common_vendor.o(($event) => goto(`/pages/settings/settings`)),
        q: isLogin.value
      }, isLogin.value ? {
        r: common_vendor.o(logout)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/my/my.vue"]]);
wx.createPage(MiniProgramPage);
