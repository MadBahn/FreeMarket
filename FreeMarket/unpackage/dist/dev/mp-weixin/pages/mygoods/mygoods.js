"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "mygoods",
  setup(__props) {
    const data = common_vendor.ref([]);
    const end_index = common_vendor.ref(0);
    common_vendor.onLoad(() => {
      request(false);
    });
    common_vendor.onPullDownRefresh(() => {
      request(true);
    });
    function request(type) {
      if (type)
        end_index.value = 0;
      const amount = 4;
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.goods.prefix + cfg.cfg.api.goods.goods_display,
        method: "POST",
        data: {
          filter: {
            start_at: end_index.value,
            amount,
            owner: getApp().globalData.login.userid
          }
        },
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            data.value = res.data.data;
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(data.value, (i, index, i0) => {
          return {
            a: common_vendor.t(i),
            b: index
          };
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/mygoods/mygoods.vue"]]);
wx.createPage(MiniProgramPage);
