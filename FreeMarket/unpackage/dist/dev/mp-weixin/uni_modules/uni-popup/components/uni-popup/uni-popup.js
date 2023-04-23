"use strict";const e=require("../../../../common/vendor.js"),h={name:"uniPopup",components:{},emits:["change","maskClick"],props:{animation:{type:Boolean,default:!0},type:{type:String,default:"center"},isMaskClick:{type:Boolean,default:null},maskClick:{type:Boolean,default:null},backgroundColor:{type:String,default:"none"},safeArea:{type:Boolean,default:!0},maskBackgroundColor:{type:String,default:"rgba(0, 0, 0, 0.4)"}},watch:{type:{handler:function(t){this.config[t]&&this[this.config[t]](!0)},immediate:!0},isDesktop:{handler:function(t){this.config[t]&&this[this.config[this.type]](!0)},immediate:!0},maskClick:{handler:function(t){this.mkclick=t},immediate:!0},isMaskClick:{handler:function(t){this.mkclick=t},immediate:!0},showPopup(t){}},data(){return{duration:300,ani:[],showPopup:!1,showTrans:!1,popupWidth:0,popupHeight:0,config:{top:"top",bottom:"bottom",center:"center",left:"left",right:"right",message:"top",dialog:"center",share:"bottom"},maskClass:{position:"fixed",bottom:0,top:0,left:0,right:0,backgroundColor:"rgba(0, 0, 0, 0.4)"},transClass:{position:"fixed",left:0,right:0},maskShow:!0,mkclick:!0,popupstyle:this.isDesktop?"fixforpc-top":"top"}},computed:{isDesktop(){return this.popupWidth>=500&&this.popupHeight>=500},bg(){return this.backgroundColor===""||this.backgroundColor==="none"?"transparent":this.backgroundColor}},mounted(){(()=>{const{windowWidth:n,windowHeight:r,windowTop:a,safeArea:s,screenHeight:i,safeAreaInsets:o}=e.index.getSystemInfoSync();this.popupWidth=n,this.popupHeight=r+(a||0),s&&this.safeArea?this.safeAreaInsets=i-s.bottom:this.safeAreaInsets=0})()},unmounted(){this.setH5Visible()},created(){this.isMaskClick===null&&this.maskClick===null?this.mkclick=!0:this.mkclick=this.isMaskClick!==null?this.isMaskClick:this.maskClick,this.animation?this.duration=300:this.duration=0,this.messageChild=null,this.clearPropagation=!1,this.maskClass.backgroundColor=this.maskBackgroundColor},methods:{setH5Visible(){},closeMask(){this.maskShow=!1},disableMask(){this.mkclick=!1},clear(t){t.stopPropagation(),this.clearPropagation=!0},open(t){if(this.showPopup&&(clearTimeout(this.timer),this.showPopup=!1),t&&["top","center","bottom","left","right","message","dialog","share"].indexOf(t)!==-1||(t=this.type),!this.config[t]){console.error("缺少类型：",t);return}this[this.config[t]](),this.$emit("change",{show:!0,type:t})},close(t){this.showTrans=!1,this.$emit("change",{show:!1,type:this.type}),clearTimeout(this.timer),this.timer=setTimeout(()=>{this.showPopup=!1},300)},touchstart(){this.clearPropagation=!1},onTap(){if(this.clearPropagation){this.clearPropagation=!1;return}this.$emit("maskClick"),this.mkclick&&this.close()},top(t){this.popupstyle=this.isDesktop?"fixforpc-top":"top",this.ani=["slide-top"],this.transClass={position:"fixed",left:0,right:0,backgroundColor:this.bg},!t&&(this.showPopup=!0,this.showTrans=!0,this.$nextTick(()=>{this.messageChild&&this.type==="message"&&this.messageChild.timerClose()}))},bottom(t){this.popupstyle="bottom",this.ani=["slide-bottom"],this.transClass={position:"fixed",left:0,right:0,bottom:0,paddingBottom:this.safeAreaInsets+"px",backgroundColor:this.bg},!t&&(this.showPopup=!0,this.showTrans=!0)},center(t){this.popupstyle="center",this.ani=["zoom-out","fade"],this.transClass={position:"fixed",display:"flex",flexDirection:"column",bottom:0,left:0,right:0,top:0,justifyContent:"center",alignItems:"center"},!t&&(this.showPopup=!0,this.showTrans=!0)},left(t){this.popupstyle="left",this.ani=["slide-left"],this.transClass={position:"fixed",left:0,bottom:0,top:0,backgroundColor:this.bg,display:"flex",flexDirection:"column"},!t&&(this.showPopup=!0,this.showTrans=!0)},right(t){this.popupstyle="right",this.ani=["slide-right"],this.transClass={position:"fixed",bottom:0,right:0,top:0,backgroundColor:this.bg,display:"flex",flexDirection:"column"},!t&&(this.showPopup=!0,this.showTrans=!0)}}};Array||e.resolveComponent("uni-transition")();const l=()=>"../../../uni-transition/components/uni-transition/uni-transition.js";Math||l();function p(t,n,r,a,s,i){return e.e({a:s.showPopup},s.showPopup?e.e({b:s.maskShow},s.maskShow?{c:e.o(i.onTap),d:e.p({name:"mask",["mode-class"]:"fade",styles:s.maskClass,duration:s.duration,show:s.showTrans})}:{},{e:i.bg,f:e.n(s.popupstyle),g:e.o((...o)=>i.clear&&i.clear(...o)),h:e.o(i.onTap),i:e.p({["mode-class"]:s.ani,name:"content",styles:s.transClass,duration:s.duration,show:s.showTrans}),j:e.o((...o)=>i.touchstart&&i.touchstart(...o)),k:e.n(s.popupstyle),l:e.n(i.isDesktop?"fixforpc-z-index":"")}):{})}const u=e._export_sfc(h,[["render",p],["__file","F:/HBuilderProjects/FreeMarket/uni_modules/uni-popup/components/uni-popup/uni-popup.vue"]]);wx.createComponent(u);
