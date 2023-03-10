"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "comment_input",
  emits: ["submit"],
  setup(__props, { emit }) {
    const content = common_vendor.ref("");
    const _comment = common_vendor.ref(null);
    function open() {
      _comment.value.open();
    }
    function submit() {
      _comment.value.close();
      emit("submit", content.value);
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(open),
        b: content.value,
        c: common_vendor.o(($event) => content.value = $event.detail.value),
        d: common_vendor.o(submit),
        e: common_vendor.sr(_comment, "3e3487ee-0", {
          "k": "_comment"
        }),
        f: common_vendor.p({
          ["background-color"]: "#fff",
          type: "bottom"
        })
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/components/comment_input/comment_input.vue"]]);
wx.createComponent(Component);
