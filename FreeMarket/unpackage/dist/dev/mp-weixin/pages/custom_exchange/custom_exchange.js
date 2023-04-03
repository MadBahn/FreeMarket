"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Math) {
  PriceKeypad();
}
const PriceKeypad = () => "../../components/price_keypad/price_keypad.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "custom_exchange",
  setup(__props) {
    common_vendor.reactive({});
    common_vendor.onLoad(() => {
      console.log(cfg.cfg);
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/custom_exchange/custom_exchange.vue"]]);
wx.createPage(MiniProgramPage);
