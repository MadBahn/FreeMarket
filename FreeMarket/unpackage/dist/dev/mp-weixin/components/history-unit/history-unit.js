"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  (historyGoods + historyPost)();
}
const historyGoods = () => "./sub/history-goods.js";
const historyPost = () => "./sub/history-post.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "history-unit",
  props: {
    data: null,
    type: null
  },
  setup(__props) {
    const props = __props;
    function goto() {
      console.log("type:", props.type);
      if (props.type === "goods")
        console.log("g");
      else if (props.type === "post")
        console.log("p");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(__props.data.post_date),
        b: __props.type === "goods"
      }, __props.type === "goods" ? {
        c: common_vendor.p({
          data: __props.data.detail
        })
      } : __props.type === "post" ? {
        e: common_vendor.p({
          data: __props.data.detail
        })
      } : {}, {
        d: __props.type === "post",
        f: common_vendor.o(goto)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/components/history-unit/history-unit.vue"]]);
wx.createComponent(Component);
