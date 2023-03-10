"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  _easycom_uni_segmented_control2();
}
const _easycom_uni_segmented_control = () => "../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
if (!Math) {
  _easycom_uni_segmented_control();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "history",
  setup(__props) {
    const data = common_vendor.ref([]);
    const start_at = common_vendor.ref(0);
    const type = common_vendor.ref("goods");
    const current = common_vendor.ref(0);
    const segItems = common_vendor.ref(["商 品", "帖 子"]);
    common_vendor.onLoad(() => {
      request(true);
    });
    common_vendor.onPullDownRefresh(() => {
      request(true);
    });
    common_vendor.onReachBottom(() => {
      request(false);
    });
    function switchSegments(e) {
      console.log(e);
      current.value = e.currentIndex;
      if (current.value === 0)
        type.value = "goods";
      else if (current.value === 1)
        type.value = "post";
    }
    function request(type2) {
      const count = 5;
      if (type2)
        start_at.value = 0;
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.user.prefix + cfg.cfg.api.user.get_history,
        method: "POST",
        data: {
          filter: {
            userid: getApp().globalData.login.userid,
            start_at: start_at.value,
            count
          }
        },
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            if (type2)
              data.value = res.data.data;
            else {
              data.value = data.value.concat(res.data.data);
              start_at.value = res.data.next_index;
            }
          }
        },
        complete() {
          common_vendor.index.stopPullDownRefresh();
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(switchSegments),
        b: common_vendor.p({
          current: current.value,
          styleType: "text",
          values: segItems.value
        }),
        c: common_vendor.f(data.value, (i, index, i0) => {
          return {
            a: common_vendor.t(i),
            b: index
          };
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/history/history.vue"]]);
wx.createPage(MiniProgramPage);
