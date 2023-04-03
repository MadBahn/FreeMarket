"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Array) {
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  _easycom_uni_file_picker2();
}
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
if (!Math) {
  _easycom_uni_file_picker();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "new_post",
  setup(__props) {
    const newPost = common_vendor.reactive({
      post_id: "",
      post_by: getApp().globalData.login.userid,
      title: "",
      content: "",
      imgs: [],
      post_date: "",
      isDel: false
    });
    const imgList = common_vendor.ref([]);
    const op = common_vendor.ref("");
    common_vendor.onLoad((option) => {
      op.value = option.op;
      if (op.value === "modify")
        ;
    });
    function request() {
      op.value === "modify" ? {
        userid: getApp().globalData.login.userid,
        modify_form: newPost
      } : {
        userid: getApp().globalData.login.userid,
        post_data: newPost
      };
      const baseURL = cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.post.prefix;
      common_vendor.index.request({
        url: baseURL + (op.value === "modify" ? cfg.cfg.api.post.modify_post : cfg.cfg.api.post.create_post),
        method: "POST",
        data: {
          userid: getApp().globalData.login.userid,
          post_data: {
            title: newPost.title,
            content: newPost.content,
            imgs: newPost.imgs
          }
        },
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            const info = op.value === "modify" ? "帖子修改成功" : "帖子创建成功";
            console.log(info);
            common_vendor.index.navigateBack();
            common_vendor.index.showToast({
              icon: "success",
              title: info
            });
          }
        }
      });
    }
    function uploadFile(e) {
      common_vendor.index.uploadFile({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.files.prefix + cfg.cfg.api.files.upload_file,
        filePath: e.tempFilePaths[0],
        name: "file",
        success(res) {
          if (res.statusCode === 200) {
            const url_t = JSON.parse(res.data)[0].path.split("\\");
            const url = "files\\\\".concat(url_t[1]);
            newPost.imgs.push({
              name: JSON.parse(res.data)[0].filename,
              url,
              extname: e.tempFiles[0].extname
            });
          }
        }
      });
    }
    function removeFile(e) {
      newPost.imgs = newPost.imgs.filter((i) => i.name !== e.tempFile.name);
      imgList.value = imgList.value.filter((i) => i.name !== e.tempFile.name);
    }
    function doPost() {
      request();
    }
    return (_ctx, _cache) => {
      return {
        a: newPost.title,
        b: common_vendor.o(($event) => newPost.title = $event.detail.value),
        c: newPost.content,
        d: common_vendor.o(($event) => newPost.content = $event.detail.value),
        e: common_vendor.o(doPost),
        f: common_vendor.o(uploadFile),
        g: common_vendor.o(removeFile),
        h: common_vendor.o(($event) => imgList.value = $event),
        i: common_vendor.p({
          fileMediatype: "image",
          limit: "9",
          title: "配图",
          modelValue: imgList.value
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/new_post/new_post.vue"]]);
wx.createPage(MiniProgramPage);
