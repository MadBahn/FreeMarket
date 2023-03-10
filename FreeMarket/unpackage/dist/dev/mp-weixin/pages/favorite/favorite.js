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
  __name: "favorite",
  setup(__props) {
    const favor_list = common_vendor.ref([]);
    const favor_out = common_vendor.ref([]);
    const current = common_vendor.ref(0);
    const type = common_vendor.ref("goods");
    const segItems = common_vendor.ref(["商 品", "帖 子"]);
    common_vendor.onLoad((option) => {
      request();
    });
    function switchSegments(e) {
      console.log(e);
      current.value = e.currentIndex;
      if (current.value === 0)
        type.value = "goods";
      else if (current.value === 1)
        type.value = "post";
      request();
    }
    function request() {
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.user.prefix + cfg.cfg.api.user.get_favorite,
        method: "POST",
        data: {
          userid: getApp().globalData.login.userid,
          type: type.value
        },
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            favor_list.value = res.data;
            for (let i in favor_list.value) {
              console.log(favor_list.value);
              console.log(favor_list.value[i]);
              console.log(typeof favor_list.value[i].refer_to);
            }
            favor_out.value = favor_list.value.map((i) => {
              i.isDel = typeof i.refer_to === "string";
              return i;
            });
          }
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
        c: common_vendor.f(favor_out.value, (i, index, i0) => {
          return common_vendor.e({
            a: i.isDel
          }, i.isDel ? {} : {
            b: common_vendor.t(i),
            c: common_vendor.unref(cfg.cfg).server + `:` + common_vendor.unref(cfg.cfg).port + `/` + i.refer_to.imgs[0].url,
            d: common_vendor.t(i.refer_to.desc)
          });
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8850f19c"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/favorite/favorite.vue"]]);
wx.createPage(MiniProgramPage);
