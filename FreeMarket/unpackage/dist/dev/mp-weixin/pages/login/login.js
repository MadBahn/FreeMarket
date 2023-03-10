"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    getApp();
    const loginForm = common_vendor.ref({
      username: "",
      password: ""
    });
    function login() {
      try {
        common_vendor.index.request({
          url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.user.prefix + cfg.cfg.api.user.login,
          method: "POST",
          data: {
            login_form: loginForm.value
          },
          success(res) {
            console.log(res);
            if (res.statusCode === 200) {
              common_vendor.index.setStorage({
                key: "user_login",
                data: res.data
              });
              getApp().globalData.login = res.data;
              common_vendor.index.$emit("user");
              common_vendor.index.switchTab({
                url: "/pages/my/my"
              });
              common_vendor.index.showToast({
                icon: "success",
                title: "登录成功"
              });
            } else {
              common_vendor.index.showToast({
                icon: "error",
                title: "登录失败"
              });
            }
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
    function gotoRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/register"
      });
    }
    return (_ctx, _cache) => {
      return {
        a: loginForm.value.username,
        b: common_vendor.o(($event) => loginForm.value.username = $event.detail.value),
        c: loginForm.value.password,
        d: common_vendor.o(($event) => loginForm.value.password = $event.detail.value),
        e: common_vendor.o(login),
        f: common_vendor.o(gotoRegister)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/login/login.vue"]]);
wx.createPage(MiniProgramPage);
