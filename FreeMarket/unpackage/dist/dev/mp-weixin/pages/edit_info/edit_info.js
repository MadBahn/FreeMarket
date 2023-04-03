"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "edit_info",
  setup(__props) {
    common_vendor.reactive({
      current: new Date()
    });
    common_vendor.reactive({
      province: [],
      cities: []
    });
    const info = common_vendor.ref({});
    common_vendor.onLoad(() => {
      info.value = getApp().globalData.login;
      console.log(info.value);
    });
    function changeBirthday(e) {
      console.log(e.detail.value);
      info.value.birthday = e.detail.value;
      console.log(info.value);
      console.log(info.value.birthday);
    }
    function onSubmit(e) {
      console.log(e.detail.value);
      common_vendor.index.request({
        url: `${cfg.cfg.server}:${cfg.cfg.port}${cfg.cfg.api.prefix}${cfg.cfg.api.user.prefix}${cfg.cfg.api.user.modify_info}`,
        method: "POST",
        data: {
          modify_form: {
            userid: getApp().globalData.login.userid,
            ...e.detail.value
          }
        },
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            getApp().globalData.login = res.data.data;
            common_vendor.index.setStorage({
              key: "user_login",
              data: res.data.data,
              complete() {
                common_vendor.index.$emit("user");
                common_vendor.index.navigateBack();
                common_vendor.index.showToast({
                  icon: "success",
                  title: "修改成功"
                });
              }
            });
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return {
        a: info.value.username,
        b: info.value.desc,
        c: info.value.gender === "male",
        d: info.value.gender === "female",
        e: info.value.gender === "others",
        f: common_vendor.t(new Date(info.value.birthday).toLocaleDateString()),
        g: info.value.birthday,
        h: common_vendor.o(changeBirthday),
        i: common_vendor.o(onSubmit)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-176afe41"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/edit_info/edit_info.vue"]]);
wx.createPage(MiniProgramPage);
