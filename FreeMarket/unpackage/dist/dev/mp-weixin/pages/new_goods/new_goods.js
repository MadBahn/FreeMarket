"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_file_picker2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_file_picker = () => "../../uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_file_picker + _easycom_uni_popup)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "new_goods",
  setup(__props) {
    const newGoods = common_vendor.ref({
      goods_id: "",
      owner: getApp().globalData.login.userid,
      goods_name: "",
      price: 0,
      desc: "",
      status: "",
      imgs: [],
      post_date: "",
      isDel: false
    });
    const price_str = common_vendor.ref(newGoods.value.price.toString());
    const operation = common_vendor.ref("");
    const imgList = common_vendor.ref([]);
    const pricePopup = common_vendor.ref(null);
    common_vendor.onLoad((option) => {
      operation.value = option.operation;
      if (operation.value === "modify") {
        common_vendor.index.request({
          url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.goods.prefix + cfg.cfg.api.goods.goods_info,
          method: "POST",
          data: {
            goods_id: option.goods_id,
            isEdit: true
          },
          success(res) {
            console.log(res);
            if (res.statusCode === 200) {
              newGoods.value = res.data.data;
              imgList.value = JSON.parse(JSON.stringify(res.data.data.imgs));
              for (let i in imgList.value) {
                imgList.value[i].url = cfg.cfg.server + ":" + cfg.cfg.port + "/" + imgList.value[i].url;
              }
              console.log(imgList.value);
              console.log(newGoods.value);
            }
          }
        });
      }
    });
    function showPrice() {
      price_str.value = newGoods.value.price.toString();
      pricePopup.value.open();
    }
    function keyboard(input) {
      console.log(input);
      switch (input) {
        case "clear": {
          price_str.value = "0";
          break;
        }
        case "<": {
          price_str.value = price_str.value.slice(0, price_str.value.length - 1);
          console.log(price_str.value.length);
          console.log(0, price_str.value.length - 1);
          console.log(price_str.value);
          if (price_str.value.length === 0)
            price_str.value = "0";
          break;
        }
        case "ok": {
          const tmp = price_str.value.split(".");
          if (tmp.length === 2 && tmp[1].length > 2) {
            tmp[1] = tmp[1].slice(0, 2);
            price_str.value = tmp[0].concat(".".concat(tmp[1]));
          }
          newGoods.value.price = price_str.value * 1;
          pricePopup.value.close();
          break;
        }
        default: {
          if (price_str.value === "0") {
            if (input === ".")
              price_str.value += input;
            else
              price_str.value = input;
          } else {
            price_str.value = price_str.value.concat(input);
            if (input === ".") {
              const regex = /[.]/g;
              const dict = price_str.value.match(regex);
              console.log(dict);
              console.log(dict.length);
              if (dict && dict.length > 1)
                price_str.value = price_str.value.slice(0, price_str.value.length - 1);
            }
          }
          console.log(price_str.value);
          break;
        }
      }
    }
    function uploadFile(e) {
      console.log("upload", e);
      console.log(newGoods.value.imgs);
      common_vendor.index.uploadFile({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.files.prefix + cfg.cfg.api.files.upload_file,
        filePath: e.tempFilePaths[0],
        name: "file",
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            const url_t = JSON.parse(res.data)[0].path.split("\\");
            const url = "files\\\\".concat(url_t[1]);
            newGoods.value.imgs.push({
              name: JSON.parse(res.data)[0].filename,
              url,
              extname: e.tempFiles[0].extname
            });
            console.log(newGoods.value.imgs);
          }
        }
      });
    }
    function removeFile(e) {
      newGoods.value.imgs = newGoods.value.imgs.filter((i) => i.name !== e.tempFile.name);
      imgList.value = imgList.value.filter((i) => i.name !== e.tempFile.name);
      console.log("imgList:", imgList.value);
      console.log(newGoods.value.imgs);
    }
    function doGoods() {
      console.log(newGoods.value);
      if (newGoods.value.imgs.length === 0) {
        newGoods.value.imgs.push(cfg.cfg.empty_image);
      }
      if (operation.value === "new") {
        console.log("new");
        common_vendor.index.request({
          url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.goods.prefix + cfg.cfg.api.goods.add_goods,
          method: "POST",
          data: {
            new_goods: {
              owner: newGoods.value.owner,
              goods_name: newGoods.value.goods_name,
              desc: newGoods.value.desc,
              price: newGoods.value.price,
              status: newGoods.value.status,
              imgs: newGoods.value.imgs
            }
          },
          success(res) {
            console.log(res);
            if (res.statusCode === 200) {
              common_vendor.index.switchTab({
                url: "/pages/index/index"
              });
              common_vendor.index.showToast({
                icon: "success",
                title: "商品添加成功"
              });
            }
          }
        });
      } else if (operation.value === "modify") {
        console.log("modify");
        common_vendor.index.request({
          url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.goods.prefix + cfg.cfg.api.goods.modify_goods,
          method: "POST",
          data: {
            modify_form: newGoods.value,
            userid: getApp().globalData.login.userid
          },
          success(res) {
            console.log(res);
            common_vendor.index.switchTab({
              url: "/pages/index/index"
            });
            if (res.statusCode === 200) {
              common_vendor.index.showToast({
                icon: "success",
                title: "商品修改成功"
              });
            }
          }
        });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: newGoods.value.goods_name,
        b: common_vendor.o(($event) => newGoods.value.goods_name = $event.detail.value),
        c: common_vendor.t(newGoods.value.price),
        d: common_vendor.p({
          type: "right"
        }),
        e: common_vendor.o(showPrice),
        f: newGoods.value.status,
        g: common_vendor.o(($event) => newGoods.value.status = $event.detail.value),
        h: newGoods.value.desc,
        i: common_vendor.o(($event) => newGoods.value.desc = $event.detail.value),
        j: common_vendor.t(operation.value === "new" ? "添加" : "修改"),
        k: common_vendor.o(doGoods),
        l: common_vendor.o(uploadFile),
        m: common_vendor.o(removeFile),
        n: common_vendor.o(($event) => imgList.value = $event),
        o: common_vendor.p({
          fileMediatype: "image",
          limit: "9",
          title: "商品图片",
          modelValue: imgList.value
        }),
        p: common_vendor.t(price_str.value),
        q: common_vendor.o(($event) => keyboard(`7`)),
        r: common_vendor.o(($event) => keyboard(`8`)),
        s: common_vendor.o(($event) => keyboard(`9`)),
        t: common_vendor.o(($event) => keyboard(`4`)),
        v: common_vendor.o(($event) => keyboard(`5`)),
        w: common_vendor.o(($event) => keyboard(`6`)),
        x: common_vendor.o(($event) => keyboard(`1`)),
        y: common_vendor.o(($event) => keyboard(`2`)),
        z: common_vendor.o(($event) => keyboard(`3`)),
        A: common_vendor.p({
          type: "left"
        }),
        B: common_vendor.o(($event) => keyboard(`<`)),
        C: common_vendor.o(($event) => keyboard(`0`)),
        D: common_vendor.o(($event) => keyboard(`.`)),
        E: common_vendor.o(($event) => keyboard(`clear`)),
        F: common_vendor.o(($event) => keyboard(`ok`)),
        G: common_vendor.sr(pricePopup, "51796122-2", {
          "k": "pricePopup"
        }),
        H: common_vendor.p({
          type: "bottom"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/new_goods/new_goods.vue"]]);
wx.createPage(MiniProgramPage);
