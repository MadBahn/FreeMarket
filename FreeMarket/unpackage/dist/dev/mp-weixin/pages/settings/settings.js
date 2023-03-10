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
    function goto(url) {
      common_vendor.index.navigateTo({
        url
      });
    }
    return (_ctx, _cache) => {
      return {
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
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/settings/settings.vue"]]);
wx.createPage(MiniProgramPage);
