"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "register",
  setup(__props) {
    getApp();
    const registerForm = common_vendor.ref({
      username: "",
      email: "",
      password: "",
      password_confirm: ""
    });
    function verifyEmail() {
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.user.prefix + cfg.cfg.api.user.verify_email + registerForm.value.email,
        success(res) {
          console.log(res);
        }
      });
    }
    function register() {
      try {
        common_vendor.index.request({
          url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.user.prefix + cfg.cfg.api.user.register,
          method: "POST",
          data: {
            register_form: registerForm.value
          },
          success(res) {
            console.log("res", res);
            if (res.statusCode === 200) {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
              common_vendor.index.showToast({
                title: "注册成功",
                icon: "success"
              });
            } else {
              common_vendor.index.showToast({
                title: "注册失败",
                icon: "error"
              });
            }
          },
          fail(err) {
            console.log("err", err);
            common_vendor.index.showToast({
              title: "服务器出了问题",
              icon: "error"
            });
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
    return (_ctx, _cache) => {
      return {
        a: registerForm.value.username,
        b: common_vendor.o(($event) => registerForm.value.username = $event.detail.value),
        c: common_vendor.o(verifyEmail),
        d: registerForm.value.email,
        e: common_vendor.o(($event) => registerForm.value.email = $event.detail.value),
        f: registerForm.value.password,
        g: common_vendor.o(($event) => registerForm.value.password = $event.detail.value),
        h: registerForm.value.password_confirm,
        i: common_vendor.o(($event) => registerForm.value.password_confirm = $event.detail.value),
        j: common_vendor.o(register)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bac4a35d"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/register/register.vue"]]);
wx.createPage(MiniProgramPage);
