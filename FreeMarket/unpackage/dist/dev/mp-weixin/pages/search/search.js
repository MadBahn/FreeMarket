"use strict";
const common_vendor = require("../../common/vendor.js");
const cfg = require("../../cfg.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "search",
  setup(__props) {
    const type = common_vendor.ref("");
    const history = common_vendor.ref(["item1", "item2", "item itemi", "item3"]);
    const searchText = common_vendor.ref("");
    const isClear = common_vendor.ref(false);
    const focusOn = common_vendor.ref(false);
    const start_at = common_vendor.ref(0);
    const result = common_vendor.ref([]);
    common_vendor.onLoad((option) => {
      type.value = option.type;
      operateHistory("w");
    });
    function operateHistory(op) {
      console.log(op);
      if (op === "r")
        ;
      else {
        if (op === "w") {
          console.log("w");
        } else if (op === "d") {
          console.log("d");
        } else if (op === "c") {
          console.log("c");
        }
      }
    }
    function onChange() {
      isClear.value = searchText.value.length > 0;
    }
    function doSearch(txt, isItem, isNew) {
      const key = isItem ? txt : searchText.value;
      if (isNew)
        start_at.value = 0;
      common_vendor.index.request({
        url: cfg.cfg.server + ":" + cfg.cfg.port + cfg.cfg.api.prefix + cfg.cfg.api.user.prefix + cfg.cfg.api.user.search,
        method: "POST",
        data: {
          search_form: {
            keyword: key,
            type: type.value,
            start_at: start_at.value,
            amount: 10
          }
        },
        success(res) {
          console.log(res);
          if (res.statusCode === 200) {
            start_at.value = res.data.next_index;
            result.value = res.data.data;
            focusOn.value = true;
            console.log(result.value);
          }
        }
      });
    }
    function clearText() {
      searchText.value = "";
      isClear.value = false;
    }
    function delHistory(i) {
      console.log("del");
      history.value = history.value.filter((_i) => _i !== i);
    }
    function clearHistory() {
      history.value = [];
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => doSearch(``, false, true)),
        b: common_vendor.o(clearText),
        c: isClear.value,
        d: common_vendor.p({
          type: "clear",
          size: "4vh"
        }),
        e: common_vendor.o([($event) => searchText.value = $event.detail.value, onChange]),
        f: searchText.value,
        g: common_vendor.p({
          type: "search",
          size: "4vh"
        }),
        h: common_vendor.o(($event) => focusOn.value = false),
        i: !focusOn.value
      }, !focusOn.value ? {
        j: common_vendor.o(clearHistory),
        k: common_vendor.f(history.value, (i, index, i0) => {
          return {
            a: common_vendor.t(i),
            b: common_vendor.o(($event) => doSearch(i, true, true), index),
            c: common_vendor.o(($event) => delHistory(i), index),
            d: "6a7a151c-2-" + i0,
            e: index
          };
        }),
        l: common_vendor.p({
          type: "close"
        })
      } : {
        m: common_vendor.t(result.value)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/pages/search/search.vue"]]);
wx.createPage(MiniProgramPage);
