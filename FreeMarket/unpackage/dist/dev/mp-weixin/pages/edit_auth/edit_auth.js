"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "edit_auth",
  setup(__props) {
    const user = common_vendor.ref({});
    common_vendor.onLoad(() => {
      user.value = getApp().globalData.login;
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/edit_auth/edit_auth.vue"]]);
wx.createPage(MiniProgramPage);
