"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "price_keypad",
  props: {
    "price": Number
  },
  emits: ["changePrice"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const price_str = common_vendor.ref(props.price.toString());
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
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(price_str.value),
        b: common_vendor.o(($event) => keyboard(`7`)),
        c: common_vendor.o(($event) => keyboard(`8`)),
        d: common_vendor.o(($event) => keyboard(`9`)),
        e: common_vendor.o(($event) => keyboard(`4`)),
        f: common_vendor.o(($event) => keyboard(`5`)),
        g: common_vendor.o(($event) => keyboard(`6`)),
        h: common_vendor.o(($event) => keyboard(`1`)),
        i: common_vendor.o(($event) => keyboard(`2`)),
        j: common_vendor.o(($event) => keyboard(`3`)),
        k: common_vendor.p({
          type: "left"
        }),
        l: common_vendor.o(($event) => keyboard(`<`)),
        m: common_vendor.o(($event) => keyboard(`0`)),
        n: common_vendor.o(($event) => keyboard(`.`)),
        o: common_vendor.o(($event) => keyboard(`clear`)),
        p: common_vendor.o(($event) => keyboard(`ok`))
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/components/price_keypad/price_keypad.vue"]]);
wx.createComponent(Component);
