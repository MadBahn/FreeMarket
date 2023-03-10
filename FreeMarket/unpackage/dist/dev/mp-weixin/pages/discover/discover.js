"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  (_easycom_uni_nav_bar2 + _easycom_uni_card2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_card)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "discover",
  setup(__props) {
    const appData = getApp().globalData;
    const posts = common_vendor.ref([]);
    const end_index = common_vendor.ref(0);
    const enableBottomRequest = common_vendor.ref(true);
    common_vendor.onPullDownRefresh(() => {
      request(true);
    });
    common_vendor.onReachBottom(() => {
      enableBottomRequest.value && request(false);
    });
    common_vendor.onLoad(() => {
      console.log("load");
      request(true);
    });
    function request(type) {
      if (type)
        end_index.value = 0;
      const amount = 4;
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.post.prefix + cfg.cfg.api.post.post_display,
        method: "POST",
        data: {
          "filter": {
            "satrt_at": end_index.value,
            "amount": amount
          }
        },
        success(res) {
          console.log(res.data);
          if (res.statusCode === 200) {
            enableBottomRequest.value = res.data.data.length === amount;
            posts.value = type ? res.data.data : posts.value.concat(res.data.data);
            end_index.value = res.data.next_index;
            common_vendor.index.stopPullDownRefresh();
          }
        }
      });
    }
    function goto(url) {
      common_vendor.index.navigateTo({
        url,
        animationType: "none"
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => goto(`/pages/search/search?type=posts`)),
        b: common_vendor.o(($event) => goto(`/pages/new_post/new_post`)),
        c: common_vendor.p({
          leftIcon: "plusempty",
          statusBar: true,
          fixed: true
        }),
        d: common_vendor.f(posts.value, (i, index, i0) => {
          return {
            a: common_vendor.t(i.title),
            b: common_vendor.o(($event) => goto(`/pages/browse_post/browse_post?id=` + i.post_id + `&userid=` + common_vendor.unref(appData).login.userid)),
            c: "7f6951af-1-" + i0
          };
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7f6951af"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/discover/discover.vue"]]);
wx.createPage(MiniProgramPage);
