"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Array) {
  const _component_commomReport = common_vendor.resolveComponent("commomReport");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  (_component_commomReport + _easycom_uni_section2)();
}
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
if (!Math) {
  (commentInput + commentDisplay + _easycom_uni_section)();
}
const commentInput = () => "../../components/comment_input/comment_input.js";
const commentDisplay = () => "../../components/comment_display/comment_display.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "browse_post",
  setup(__props) {
    getApp();
    const post = common_vendor.ref({});
    common_vendor.onLoad((option) => {
      console.log(option);
      common_vendor.index.showNavigationBarLoading();
      request(option);
    });
    function getSubmit(c) {
      common_vendor.index.request({
        url: `${cfg.cfg.server}:${cfg.cfg.port}${cfg.cfg.api.prefix}${cfg.cfg.api.user.prefix}${cfg.cfg.api.user.create_comment}`,
        method: "POST",
        data: {
          comment_form: {
            content: c,
            comment_to: post.value.post_id,
            comment_by: getApp().globalData.login.userid
          }
        },
        success(res) {
          if (res.statusCode === 200) {
            const t = res.data;
            t.comment_by = getApp().globalData.login;
            post.value.comments.push(t);
          }
        }
      });
    }
    function request(data) {
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.post.prefix + cfg.cfg.api.post.read_post,
        method: "POST",
        data: {
          post_id: data.id,
          userid: data.userid
        },
        // 只要能发起请求并得到服务器响应就算success
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            post.value = res.data.data;
            common_vendor.index.setNavigationBarTitle({
              title: post.value.title
            });
          }
        },
        complete() {
          common_vendor.index.hideNavigationBarLoading();
        }
      });
    }
    function call_post() {
      call_report(post.value.post_id);
    }
    function call_report(id) {
      common_vendor.index.navigateTo({
        url: `/pages/report/report?refer_to=${id}&report_by=${getApp().globalData.login.userid}`
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.unref(cfg.cfg).server + `:` + common_vendor.unref(cfg.cfg).port + `/` + post.value.post_by.headImg || common_vendor.unref(cfg.cfg).default_avatar,
        b: common_vendor.t(post.value.post_by.username),
        c: common_vendor.t(new Date(post.value.post_date).toLocaleString()),
        d: common_vendor.f(post.value.imgs, (i, index, i0) => {
          return {
            a: common_vendor.unref(cfg.cfg).server + ":" + common_vendor.unref(cfg.cfg).port + "/" + i.url,
            b: index
          };
        }),
        e: common_vendor.t(post.value.content),
        f: common_vendor.o(call_post),
        g: common_vendor.o(getSubmit),
        h: common_vendor.o(call_report),
        i: common_vendor.p({
          _data: post.value.comments
        }),
        j: common_vendor.p({
          id: "comment",
          titleFontSize: "20px",
          title: "评论",
          type: "line"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/browse_post/browse_post.vue"]]);
wx.createPage(MiniProgramPage);
