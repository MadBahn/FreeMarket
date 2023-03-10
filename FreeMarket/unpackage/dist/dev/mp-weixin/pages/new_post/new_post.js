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
    const imgList = common_vendor.ref([]);
    function uploadFile(e) {
      common_vendor.index.uploadFile({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.files.prefix + cfg.cfg.api.files.upload_file,
        filePath: e.tempFilePaths[0],
        name: "file",
        success(res) {
        }
      });
    }
    function removeFile(e) {
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(uploadFile),
        b: common_vendor.o(removeFile),
        c: common_vendor.o(($event) => imgList.value = $event),
        d: common_vendor.p({
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
