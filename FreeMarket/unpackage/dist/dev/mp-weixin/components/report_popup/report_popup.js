"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "report_popup",
  setup(__props) {
    common_vendor.onLoad(() => {
      console.log("onLoad");
    });
    common_vendor.onShow(() => {
      console.log("onShow");
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
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/components/report_popup/report_popup.vue"]]);
wx.createComponent(Component);
