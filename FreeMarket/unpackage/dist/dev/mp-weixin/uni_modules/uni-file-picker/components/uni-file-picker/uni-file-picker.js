"use strict";const a=require("../../../../common/vendor.js"),c=require("./choose-and-upload-file.js"),u=require("./utils.js"),d=()=>"./upload-image.js",m=()=>"./upload-file.js",p={name:"uniFilePicker",components:{uploadImage:d,uploadFile:m},options:{virtualHost:!0},emits:["select","success","fail","progress","delete","update:modelValue","input"],props:{modelValue:{type:[Array,Object],default(){return[]}},disabled:{type:Boolean,default:!1},disablePreview:{type:Boolean,default:!1},delIcon:{type:Boolean,default:!0},autoUpload:{type:Boolean,default:!0},limit:{type:[Number,String],default:9},mode:{type:String,default:"grid"},fileMediatype:{type:String,default:"image"},fileExtname:{type:[Array,String],default(){return[]}},title:{type:String,default:""},listStyles:{type:Object,default(){return{border:!0,dividline:!0,borderStyle:{}}}},imageStyles:{type:Object,default(){return{width:"auto",height:"auto"}}},readonly:{type:Boolean,default:!1},returnType:{type:String,default:"array"},sizeType:{type:Array,default(){return["original","compressed"]}}},data(){return{files:[],localValue:[]}},watch:{modelValue:{handler(e,t){this.setValue(e,t)},immediate:!0}},computed:{filesList(){let e=[];return this.files.forEach(t=>{e.push(t)}),e},showType(){return this.fileMediatype==="image"?this.mode:"list"},limitLength(){return this.returnType==="object"||!this.limit?1:this.limit>=9?9:this.limit}},created(){a.Ls.config&&a.Ls.config.provider||(this.noSpace=!0,a.Ls.chooseAndUploadFile=c.chooseAndUploadFile),this.form=this.getForm("uniForms"),this.formItem=this.getForm("uniFormsItem"),this.form&&this.formItem&&this.formItem.name&&(this.rename=this.formItem.name,this.form.inputChildrens.push(this))},methods:{clearFiles(e){e!==0&&!e?(this.files=[],this.$nextTick(()=>{this.setEmit()})):this.files.splice(e,1),this.$nextTick(()=>{this.setEmit()})},upload(){let e=[];return this.files.forEach((t,i)=>{(t.status==="ready"||t.status==="error")&&e.push(Object.assign({},t))}),this.uploadFiles(e)},async setValue(e,t){const i=async s=>{const l=/cloud:\/\/([\w.]+\/?)\S*/;let r="";return s.fileID?r=s.fileID:r=s.url,l.test(r)&&(s.fileID=r,s.url=await this.getTempFileURL(r)),s.url&&(s.path=s.url),s};if(this.returnType==="object")e?await i(e):e={};else{e||(e=[]);for(let s=0;s<e.length;s++){let l=e[s];await i(l)}}this.localValue=e,this.form&&this.formItem&&!this.is_reset&&(this.is_reset=!1,this.formItem.setValue(this.localValue));let o=Object.keys(e).length>0?e:[];this.files=[].concat(o)},choose(){if(!this.disabled){if(this.files.length>=Number(this.limitLength)&&this.showType!=="grid"&&this.returnType==="array"){a.index.showToast({title:`您最多选择 ${this.limitLength} 个文件`,icon:"none"});return}this.chooseFiles()}},chooseFiles(){const e=u.get_extname(this.fileExtname);a.Ls.chooseAndUploadFile({type:this.fileMediatype,compressed:!1,sizeType:this.sizeType,extension:e.length>0?e:void 0,count:this.limitLength-this.files.length,onChooseFile:this.chooseFileCallback,onUploadProgress:t=>{this.setProgress(t,t.index)}}).then(t=>{this.setSuccessAndError(t.tempFiles)}).catch(t=>{console.log("选择失败",t)})},async chooseFileCallback(e){const t=u.get_extname(this.fileExtname);(Number(this.limitLength)===1&&this.disablePreview&&!this.disabled||this.returnType==="object")&&(this.files=[]);let{filePaths:o,files:s}=u.get_files_and_is_max(e,t);t&&t.length>0||(o=e.tempFilePaths,s=e.tempFiles);let l=[];for(let r=0;r<s.length&&!(this.limitLength-this.files.length<=0);r++){s[r].uuid=Date.now();let n=await u.get_file_data(s[r],this.fileMediatype);n.progress=0,n.status="ready",this.files.push(n),l.push({...n,file:s[r]})}this.$emit("select",{tempFiles:l,tempFilePaths:o}),e.tempFiles=s,(!this.autoUpload||this.noSpace)&&(e.tempFiles=[])},uploadFiles(e){return e=[].concat(e),c.uploadCloudFiles.call(this,e,5,t=>{this.setProgress(t,t.index,!0)}).then(t=>(this.setSuccessAndError(t),t)).catch(t=>{console.log(t)})},async setSuccessAndError(e,t){let i=[],o=[],s=[],l=[];for(let r=0;r<e.length;r++){const n=e[r],h=n.uuid?this.files.findIndex(f=>f.uuid===n.uuid):n.index;if(h===-1||!this.files)break;n.errMsg==="request:fail"?(this.files[h].url=n.path,this.files[h].status="error",this.files[h].errMsg=n.errMsg,o.push(this.files[h]),l.push(this.files[h].url)):(this.files[h].errMsg="",this.files[h].fileID=n.url,/cloud:\/\/([\w.]+\/?)\S*/.test(n.url)?this.files[h].url=await this.getTempFileURL(n.url):this.files[h].url=n.url,this.files[h].status="success",this.files[h].progress+=1,i.push(this.files[h]),s.push(this.files[h].fileID))}i.length>0&&(this.setEmit(),this.$emit("success",{tempFiles:this.backObject(i),tempFilePaths:s})),o.length>0&&this.$emit("fail",{tempFiles:this.backObject(o),tempFilePaths:l})},setProgress(e,t,i){this.files.length;const o=Math.round(e.loaded*100/e.total);let s=t;i||(s=this.files.findIndex(l=>l.uuid===e.tempFile.uuid)),!(s===-1||!this.files[s])&&(this.files[s].progress=o-1,this.$emit("progress",{index:s,progress:parseInt(o),tempFile:this.files[s]}))},delFile(e){this.$emit("delete",{tempFile:this.files[e],tempFilePath:this.files[e].url}),this.files.splice(e,1),this.$nextTick(()=>{this.setEmit()})},getFileExt(e){const t=e.lastIndexOf("."),i=e.length;return{name:e.substring(0,t),ext:e.substring(t+1,i)}},setEmit(){let e=[];this.returnType==="object"?(e=this.backObject(this.files)[0],this.localValue=e||null):(e=this.backObject(this.files),this.localValue||(this.localValue=[]),this.localValue=[...e]),this.$emit("update:modelValue",this.localValue)},backObject(e){let t=[];return e.forEach(i=>{t.push({extname:i.extname,fileType:i.fileType,image:i.image,name:i.name,path:i.path,size:i.size,fileID:i.fileID,url:i.url})}),t},async getTempFileURL(e){return e={fileList:[].concat(e)},(await a.Ls.getTempFileURL(e)).fileList[0].tempFileURL||""},getForm(e="uniForms"){let t=this.$parent,i=t.$options.name;for(;i!==e;){if(t=t.$parent,!t)return!1;i=t.$options.name}return t}}};if(!Array){const e=a.resolveComponent("upload-image"),t=a.resolveComponent("upload-file");(e+t)()}function g(e,t,i,o,s,l){return a.e({a:i.title},i.title?{b:a.t(i.title),c:a.t(l.filesList.length),d:a.t(l.limitLength)}:{},{e:i.fileMediatype==="image"&&l.showType==="grid"},i.fileMediatype==="image"&&l.showType==="grid"?{f:a.o(l.uploadFiles),g:a.o(l.choose),h:a.o(l.delFile),i:a.p({readonly:i.readonly,["image-styles"]:i.imageStyles,["files-list"]:l.filesList,limit:l.limitLength,disablePreview:i.disablePreview,delIcon:i.delIcon})}:{},{j:i.fileMediatype!=="image"||l.showType!=="grid"},i.fileMediatype!=="image"||l.showType!=="grid"?{k:a.o(l.uploadFiles),l:a.o(l.choose),m:a.o(l.delFile),n:a.p({readonly:i.readonly,["list-styles"]:i.listStyles,["files-list"]:l.filesList,showType:l.showType,delIcon:i.delIcon})}:{})}const y=a._export_sfc(p,[["render",g],["__file","F:/HBuilderProjects/FreeMarket/uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.vue"]]);wx.createComponent(y);
