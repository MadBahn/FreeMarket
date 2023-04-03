"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "common_report"
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      customPrefix: "iconfont",
      type: "icon-report"
    }),
    b: common_vendor.o(($event) => _ctx.$emit(`call`))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "F:/HBuilderProjects/FreeMarket/components/common_report/common_report.vue"]]);
wx.createComponent(Component);
