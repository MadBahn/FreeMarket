"use strict";const e=require("../../common/vendor.js"),r=require("../../cfg.js");Array||e.resolveComponent("uni-icons")();const S=()=>"../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";Math||(S+P+j)();const P=()=>"../../components/goods_unit/goods_unit.js",j=()=>"../../components/post_unit/post_unit.js",C=e.defineComponent({__name:"search",setup(m){const i=e.ref(""),a=e.ref(),c=e.ref(""),d=e.ref(!1),v=e.ref(!1),g=e.ref(0),_=e.ref([]),p=e.ref(!0);e.onLoad(t=>{i.value=t.type,f("r",null,0)}),e.onReachBottom(()=>{h(c.value,!1,!1)});function f(t,s,o){if(console.log(o),t==="r")a.value=JSON.parse(e.index.getStorageSync("history"));else{if(t==="w"){if(s==="")return;console.log(a.value.includes(s)),a.value.includes(s)&&a.value.filter(u=>u!==s),console.log(a.value),a.value.push(s),console.log(a.value);let n=a.value[0];const l=a.value.indexOf(s);a.value[0]=s,a.value[l]=n,console.log(a.value)}else t==="d"?a.value=a.value.splice(o,1):t==="c"&&(a.value=[]);console.log("setStorage"),e.index.setStorageSync("history",JSON.stringify(a.value))}console.log(a.value)}function y(){d.value=c.value.length>0}function h(t,s,o){const n=s?t:c.value,l=2;o&&(g.value=0),f("w",t,0),e.index.request({url:r.cfg.server+":"+r.cfg.port+r.cfg.api.prefix+r.cfg.api.user.prefix+r.cfg.api.user.search,method:"POST",data:{search_form:{keyword:n,type:i.value,start_at:g.value,amount:l}},success(u){console.log(u),u.statusCode===200&&(p.value=u.data.data.length===l,g.value=u.data.next_index,_.value=u.data.data,v.value=!0,console.log(_.value))}})}function x(){c.value="",d.value=!1}return(t,s)=>e.e({a:e.o(o=>h(c.value,!1,!0)),b:e.o(x),c:d.value,d:e.p({type:"clear",size:"4vh"}),e:e.o([o=>c.value=o.detail.value,y]),f:c.value,g:e.p({type:"search",size:"4vh"}),h:e.o(o=>v.value=!1),i:!v.value},v.value?e.e({m:e.f(_.value,(o,n,l)=>i.value==="goods"?{a:"6a7a151c-3-"+l,b:e.p({data:o})}:{c:"6a7a151c-4-"+l,d:e.p({data:o})}),n:i.value==="goods",o:!p.value},p.value?{}:{}):{j:e.o(o=>f("c",null,0)),k:e.f(a.value,(o,n,l)=>({a:e.t(o),b:e.o(u=>h(o,!0,!0),n),c:e.o(u=>f("d",o,n),n),d:"6a7a151c-2-"+l,e:n})),l:e.p({type:"close"})})}}),O=e._export_sfc(C,[["__file","F:/HBuilderProjects/FreeMarket/pages/search/search.vue"]]);wx.createPage(O);
