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
  __name: "index",
  setup(__props) {
    const ctrl1 = common_vendor.ref(true);
    const app = getApp();
    const goods = common_vendor.ref([]);
    const end_index = common_vendor.ref(0);
    const enableBottomRequest = common_vendor.ref(true);
    common_vendor.onLoad(() => {
      request(true);
      console.log("globalData:", app.globalData);
    });
    common_vendor.onShow(() => {
      console.log("onShow");
      ctrl1.value = true;
      console.log(ctrl1.value);
    });
    common_vendor.onHide(() => {
      console.log("onHide");
      ctrl1.value = false;
      console.log(ctrl1.value);
    });
    common_vendor.onReachBottom(() => {
      console.log("reach bottom");
      enableBottomRequest.value && request(false);
    });
    common_vendor.onPullDownRefresh(() => {
      console.log("pull down refresh");
      request(true);
    });
    function request(type) {
      if (type)
        end_index.value = 0;
      const amount = 4;
      common_vendor.index.request({
        url: "http://localhost:4000/api/goods/goods_display",
        method: "POST",
        data: {
          "filter": {
            "start_at": end_index.value,
            "amount": amount
          }
        },
        success(res) {
          console.log(res.data);
          if (res.statusCode === 200) {
            enableBottomRequest.value = res.data.data.length === amount;
            goods.value = type ? res.data.data : goods.value.concat(res.data.data);
            end_index.value = res.data.next_index;
            common_vendor.index.stopPullDownRefresh();
          }
        }
      });
    }
    function gotoGoods(i) {
      common_vendor.index.navigateTo({
        url: "/pages/browse_goods/browse_goods?id=" + i.goods_id + "&userid=" + getApp().globalData.login.userid
      });
    }
    function gotoSearch() {
      common_vendor.index.navigateTo({
        url: "/pages/search/search?type=goods",
        animationType: "none"
      });
    }
    function gotoNewGoods() {
      common_vendor.index.navigateTo({
        url: "/pages/new_goods/new_goods?operation=new"
        // url: "/pages/new_goods/new_goods?operation=modify&goods_id=goods:0fc22747-88f7-434c-834f-7bf536ffca54"
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(gotoSearch),
        b: common_vendor.o(gotoNewGoods),
        c: common_vendor.p({
          leftIcon: "plusempty",
          statusBar: true,
          fixed: true
        }),
        d: common_vendor.f(4, (i, k0, i0) => {
          return {
            a: common_vendor.o(($event) => gotoGoods(i))
          };
        }),
        e: common_vendor.f(goods.value, (i, index, i0) => {
          return {
            a: common_vendor.t(i.goods_name),
            b: common_vendor.t(i.price),
            c: common_vendor.o(($event) => gotoGoods(i), index),
            d: index,
            e: "1cf27b2a-1-" + i0,
            f: common_vendor.p({
              cover: common_vendor.unref(cfg.cfg).server + `:` + common_vendor.unref(cfg.cfg).port + `/` + i.imgs[0].url || ``
            })
          };
        }),
        f: !enableBottomRequest.value
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
