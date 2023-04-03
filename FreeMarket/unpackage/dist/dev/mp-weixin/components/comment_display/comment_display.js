"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Array) {
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  _easycom_uni_card2();
}
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
if (!Math) {
  (commonReport + _easycom_uni_card)();
}
const commonReport = () => "../common_report/common_report.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "comment_display",
  props: {
    _data: Array
  },
  setup(__props) {
    common_vendor.ref(cfg.cfg.default_avatar);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props._data.length === 0
      }, __props._data.length === 0 ? {} : {
        b: common_vendor.f(__props._data, (i, index, i0) => {
          return {
            a: common_vendor.t(i.content),
            b: common_vendor.o(($event) => _ctx.$emit("report", i.comment_id), i.comment_id),
            c: "a34d7f72-1-" + i0 + "," + ("a34d7f72-0-" + i0),
            d: "a34d7f72-0-" + i0,
            e: common_vendor.p({
              title: i.comment_by.username || i.comment_by,
              isFull: true,
              ["sub-title"]: new Date(i.post_date).toLocaleString(),
              thumbnail: common_vendor.unref(cfg.cfg).server + `:` + common_vendor.unref(cfg.cfg).port + `/` + i.comment_by.headImg
            }),
            f: i.comment_id
          };
        })
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a34d7f72"], ["__file", "F:/HBuilderProjects/FreeMarket/components/comment_display/comment_display.vue"]]);
wx.createComponent(Component);
