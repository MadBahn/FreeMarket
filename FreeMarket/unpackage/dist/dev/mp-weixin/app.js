"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/discover/discover.js";
  "./pages/message/message.js";
  "./pages/my/my.js";
  "./pages/favorite/favorite.js";
  "./pages/exchange/exchange.js";
  "./pages/new_post/new_post.js";
  "./pages/new_goods/new_goods.js";
  "./pages/chat/chat.js";
  "./pages/login/login.js";
  "./pages/register/register.js";
  "./pages/browse_goods/browse_goods.js";
  "./pages/edit_info/edit_info.js";
  "./pages/search/search.js";
  "./pages/browse_post/browse_post.js";
  "./pages/history/history.js";
  "./pages/settings/settings.js";
  "./pages/mygoods/mygoods.js";
  "./pages/report/report.js";
  "./pages/edit_auth/edit_auth.js";
  "./pages/custom_exchange/custom_exchange.js";
}
const _sfc_main = {
  onLaunch() {
    try {
      common_vendor.index.getStorage({
        key: "user_login",
        success(res) {
          console.log(res);
          getApp().globalData.login = res.data;
        }
      });
    } catch (e) {
    }
  },
  onShow() {
  },
  onHide() {
  },
  globalData: {
    text: "abc",
    login: {}
  }
};
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/App.vue"]]);
require("./vue-devtools/hook.js");
require("./vue-devtools/backend.js");
function createApp() {
  const app = common_vendor.createSSRApp(App);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
