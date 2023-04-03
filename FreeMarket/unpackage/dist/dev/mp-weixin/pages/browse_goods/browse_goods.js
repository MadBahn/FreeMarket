"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Array) {
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_card2 + _easycom_uni_section2 + _easycom_uni_icons2)();
}
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (contentLoading + contentError + commonReport + _easycom_uni_card + commentInput + commentDisplay + _easycom_uni_section + _easycom_uni_icons)();
}
const commentInput = () => "../../components/comment_input/comment_input.js";
const commentDisplay = () => "../../components/comment_display/comment_display.js";
const contentLoading = () => "../../components/content_loading/content_loading.js";
const contentError = () => "../../components/content_error/content_error.js";
const commonReport = () => "../../components/common_report/common_report.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "browse_goods",
  setup(__props) {
    const content = common_vendor.ref({});
    const query = common_vendor.ref({});
    const isLoading = common_vendor.ref(true);
    const isError = common_vendor.ref(false);
    common_vendor.onLoad((option) => {
      common_vendor.index.showNavigationBarLoading();
      query.value.id = option.id;
      query.value.userid = option.userid;
      request(query.value);
    });
    common_vendor.onError((err) => {
      console.log(err);
    });
    function request(data) {
      common_vendor.index.request({
        url: `${cfg.cfg.server}:${cfg.cfg.port}${cfg.cfg.api.prefix}${cfg.cfg.api.goods.prefix}${cfg.cfg.api.goods.goods_info}`,
        method: "POST",
        data: {
          goods_id: data.id,
          userid: data.userid
        },
        success(res) {
          console.log(res);
          content.value = res.data.data;
          if (content.value.error)
            isError.value = true;
          console.log(content.value);
        },
        fail() {
          isError.value = true;
          common_vendor.index.setNavigationBarTitle({
            title: "出错了"
          });
        },
        complete() {
          isLoading.value = false;
          common_vendor.index.hideNavigationBarLoading();
        }
      });
    }
    function getSubmit(c) {
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.user.prefix + cfg.cfg.api.user.create_comment,
        method: "POST",
        data: {
          comment_form: {
            content: c,
            comment_to: content.value.goods_id,
            comment_by: getApp().globalData.login.userid
          }
        },
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            const t = res.data;
            t.comment_by = getApp().globalData.login;
            content.value.comments.push(t);
          }
        }
      });
    }
    function comment() {
      common_vendor.index.createSelectorQuery().select("#comment").boundingClientRect((data) => {
        common_vendor.index.createSelectorQuery().select(".main_content").boundingClientRect((res) => {
          common_vendor.index.pageScrollTo({
            duration: 100,
            scrollTop: data.top - res.top
          });
        }).exec();
      }).exec();
    }
    function favorite() {
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.user.prefix + cfg.cfg.api.user.favorite,
        method: "POST",
        data: {
          favorite_form: {
            userid: getApp().globalData.login.userid,
            refer_to: content.value.goods_id
          }
        },
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            common_vendor.index.showToast({
              icon: "success",
              title: res.data.msg
            });
            content.value.isFavorite = !content.value.isFavorite;
          }
        }
      });
    }
    function want() {
    }
    function call_goods() {
      console.log("reach call");
      call_report(content.value.goods_id);
    }
    function call_report(id) {
      console.log(id);
      common_vendor.index.navigateTo({
        url: "/pages/report/report?refer_to=" + id + "&report_by=" + getApp().globalData.login.userid
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value
      }, isLoading.value ? {} : {}, {
        b: isError.value
      }, isError.value ? {} : {}, {
        c: !isError.value
      }, !isError.value ? common_vendor.e({
        d: common_vendor.t(content.value.price),
        e: common_vendor.t(content.value.status),
        f: common_vendor.t(content.value.desc),
        g: common_vendor.f(content.value.imgs, (i, index, i0) => {
          return {
            a: index,
            b: common_vendor.unref(cfg.cfg).server + `:` + common_vendor.unref(cfg.cfg).port + `/` + i.url
          };
        }),
        h: common_vendor.o(call_goods),
        i: common_vendor.p({
          isFull: "true",
          avatarCircle: "true",
          title: content.value.owner.username || content.value.owner,
          subTitle: new Date(content.value.post_date).toLocaleString(),
          thumbnail: common_vendor.unref(cfg.cfg).server + `:` + common_vendor.unref(cfg.cfg).port + `/` + content.value.owner.headImg || common_vendor.unref(cfg.cfg).default_avatar
        }),
        j: common_vendor.o(getSubmit),
        k: common_vendor.o(call_report),
        l: common_vendor.p({
          _data: content.value.comments
        }),
        m: common_vendor.p({
          id: "comment",
          titleFontSize: "20px",
          title: "评论",
          type: "line"
        }),
        n: !content.value.error
      }, !content.value.error ? {
        o: common_vendor.o(comment),
        p: common_vendor.p({
          color: "#1296db",
          size: "40",
          type: "chat"
        }),
        q: common_vendor.o(favorite),
        r: common_vendor.p({
          color: "#1296db",
          size: "40",
          type: content.value.isFavorite ? "star-filled" : "star"
        }),
        s: common_vendor.o(want)
      } : {}) : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fdc5c65b"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/browse_goods/browse_goods.vue"]]);
wx.createPage(MiniProgramPage);
