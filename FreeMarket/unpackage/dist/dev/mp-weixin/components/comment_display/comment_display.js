"use strict";
const cfg = require("../../cfg.js");
const common_vendor = require("../../common/vendor.js");
const commonReport = () => "../common_report/common_report.js";
const _sfc_main = {
  name: "comment_display",
  // emits: ['report'],
  components: {
    commonReport
  },
  data() {
    return {
      default_avatar: cfg.cfg.default_avatar
    };
  },
  props: {
    _data: Array
  }
};
if (!Array) {
  const _component_commonReport = common_vendor.resolveComponent("commonReport");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  (_component_commonReport + _easycom_uni_card2)();
}
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
if (!Math) {
  _easycom_uni_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props._data.length === 0
  }, $props._data.length === 0 ? {} : {}, {
    b: common_vendor.f($props._data, (i, index, i0) => {
      return {
        a: common_vendor.t(i.content),
        b: common_vendor.o(($event) => _ctx.$emit("report", i.comment_id), index),
        c: "a34d7f72-1-" + i0 + "," + ("a34d7f72-0-" + i0),
        d: "a34d7f72-0-" + i0,
        e: common_vendor.p({
          title: i.comment_by.username || i.comment_by,
          isFull: true,
          ["sub-title"]: new Date(i.post_date).toLocaleString(),
          thumbnail: i.comment_by.headImg || $data.default_avatar
        }),
        f: index
      };
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a34d7f72"], ["__file", "F:/HBuilderProjects/FreeMarket/components/comment_display/comment_display.vue"]]);
wx.createComponent(Component);
