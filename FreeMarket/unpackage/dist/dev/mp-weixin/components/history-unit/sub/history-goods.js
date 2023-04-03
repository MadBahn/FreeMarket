"use strict";
const common_vendor = require("../../../common/vendor.js");
const cfg = require("../../../cfg.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "history-goods",
  props: {
    data: null
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.data.imgs.length !== 0
      }, __props.data.imgs.length !== 0 ? {
        b: `${common_vendor.unref(cfg.cfg).server}:${common_vendor.unref(cfg.cfg).port}/${__props.data.imgs[0].url}`
      } : {}, {
        c: common_vendor.t(__props.data.goods_name),
        d: common_vendor.t(__props.data.desc),
        e: common_vendor.t(__props.data.price)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9788bc81"], ["__file", "F:/HBuilderProjects/FreeMarket/components/history-unit/sub/history-goods.vue"]]);
wx.createComponent(Component);
