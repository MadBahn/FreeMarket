"use strict";const i=require("../../../../common/vendor.js"),h=()=>"./uni-status-bar.js",r=n=>typeof n=="number"?n+"px":n,c={name:"UniNavBar",components:{statusBar:h},emits:["clickLeft","clickRight","clickTitle"],props:{dark:{type:Boolean,default:!1},title:{type:String,default:""},leftText:{type:String,default:""},rightText:{type:String,default:""},leftIcon:{type:String,default:""},rightIcon:{type:String,default:""},fixed:{type:[Boolean,String],default:!1},color:{type:String,default:""},backgroundColor:{type:String,default:""},statusBar:{type:[Boolean,String],default:!1},shadow:{type:[Boolean,String],default:!1},border:{type:[Boolean,String],default:!0},height:{type:[Number,String],default:44},leftWidth:{type:[Number,String],default:60},rightWidth:{type:[Number,String],default:60},stat:{type:[Boolean,String],default:""}},computed:{themeBgColor(){return this.dark?this.backgroundColor?this.backgroundColor:this.dark?"#333":"#FFF":this.backgroundColor||"#FFF"},themeColor(){return this.dark?this.color?this.color:this.dark?"#fff":"#333":this.color||"#333"},navbarHeight(){return r(this.height)},leftIconWidth(){return r(this.leftWidth)},rightIconWidth(){return r(this.rightWidth)}},mounted(){i.index.report&&this.stat&&this.title!==""&&i.index.report("title",this.title)},methods:{onClickLeft(){this.$emit("clickLeft")},onClickRight(){this.$emit("clickRight")},onClickTitle(){this.$emit("clickTitle")}}};if(!Array){const n=i.resolveComponent("status-bar"),a=i.resolveComponent("uni-icons");(n+a)()}const o=()=>"../../../uni-icons/components/uni-icons/uni-icons.js";Math||o();function u(n,a,t,f,d,e){return i.e({a:t.statusBar},t.statusBar?{}:{},{b:t.leftIcon.length>0},t.leftIcon.length>0?{c:i.p({color:e.themeColor,type:t.leftIcon,size:"20"})}:{},{d:t.leftText.length},t.leftText.length?{e:i.t(t.leftText),f:e.themeColor,g:!t.leftIcon.length>0?1:""}:{},{h:i.o((...l)=>e.onClickLeft&&e.onClickLeft(...l)),i:e.leftIconWidth,j:t.title.length>0},t.title.length>0?{k:i.t(t.title),l:e.themeColor}:{},{m:i.o((...l)=>e.onClickTitle&&e.onClickTitle(...l)),n:t.rightIcon.length},t.rightIcon.length?{o:i.p({color:e.themeColor,type:t.rightIcon,size:"22"})}:{},{p:t.rightText.length&&!t.rightIcon.length},t.rightText.length&&!t.rightIcon.length?{q:i.t(t.rightText),r:e.themeColor}:{},{s:i.o((...l)=>e.onClickRight&&e.onClickRight(...l)),t:e.rightIconWidth,v:e.themeColor,w:e.themeBgColor,x:e.navbarHeight,y:t.fixed?1:"",z:t.shadow?1:"",A:t.border?1:"",B:e.themeBgColor,C:t.fixed},t.fixed?i.e({D:t.statusBar},t.statusBar?{}:{},{E:e.navbarHeight}):{},{F:t.dark?1:"",G:t.fixed?1:""})}const g=i._export_sfc(c,[["render",u],["__scopeId","data-v-26544265"],["__file","F:/HBuilderProjects/FreeMarket/uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.vue"]]);wx.createComponent(g);
