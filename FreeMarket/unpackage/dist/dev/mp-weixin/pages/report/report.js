"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "report",
  setup(__props) {
    common_vendor.onLoad((option) => {
      console.log("onLoad");
      console.log(option);
    });
    function onSubmit(e) {
      console.log(e.detail.value);
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.user.prefix + cfg.cfg.api.user.create_report,
        method: "POST",
        data: {
          report_form: {
            ...e.detail.value
          }
        },
        success(res) {
          console.log(res);
          common_vendor.index.navigateBack();
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onSubmit)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/report/report.vue"]]);
wx.createPage(MiniProgramPage);
