"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_list_item + _easycom_uni_list)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "settings",
  setup(__props) {
    const isLogin = common_vendor.ref(false);
    common_vendor.onLoad(() => {
      isLogin.value = Object.keys(getApp().globalData.login).length !== 0;
    });
    function goto(url) {
      common_vendor.index.navigateTo({
        url
      });
    }
    function logout() {
      common_vendor.index.$emit("logout");
      common_vendor.index.navigateBack();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => goto("/pages/edit_info/edit_info")),
        b: common_vendor.p({
          title: "更改账户信息",
          clickable: "true"
        }),
        c: common_vendor.p({
          title: "账户安全",
          clickable: "true"
        }),
        d: common_vendor.p({
          title: "用户协议",
          clickable: "true"
        }),
        e: common_vendor.p({
          title: "关于本应用",
          clickable: "true"
        }),
        f: common_vendor.p({
          border: "true"
        }),
        g: isLogin.value
      }, isLogin.value ? {
        h: common_vendor.o(logout)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/settings/settings.vue"]]);
wx.createPage(MiniProgramPage);
