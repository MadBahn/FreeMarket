<template>
	<view class="content">
		<view>
			<!-- 标题 -->
			<input v-model="newPost.title" placeholder="帖子标题"/>
			<!-- 正文 -->
			<textarea v-model="newPost.content" placeholder="正文"></textarea>
			<!-- 按钮 -->
			<button @click="doPost">发表</button>
			<!-- 配图 -->
			<uni-file-picker
				v-model="imgList"
				fileMediatype="image"
				limit="9"
				title="配图"
				@select="uploadFile"
				@delete="removeFile"
			></uni-file-picker>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { reactive, ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import cfg from "../../cfg.json";
	
	const newPost = reactive({
		post_id: "",
		post_by: getApp().globalData.login.userid,
		title: "",
		content: "",
		imgs: [],
		post_date: "",
		isDel: false
	});
	
	const imgList = ref([]);
	const op = ref("");
	
	onLoad((option) => {
		op.value = option.op;
		if(op.value === "modify") {
			// 修改帖子
			
		}
	});
	
	function request() {
		const reqBody = (op.value === "modify") ? {
			userid: getApp().globalData.login.userid,
			modify_form: newPost
		} : {
			userid: getApp().globalData.login.userid,
			post_data: newPost
		};
		const baseURL = cfg.server + ":" + cfg.port + 
						cfg.api.prefix + 
						cfg.api.post.prefix;
				
		uni.request({
			url: baseURL + (
				op.value === "modify" ?
				cfg.api.post.modify_post :
				cfg.api.post.create_post
			),
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
				if(res.statusCode === 200) {
					const info = (
						op.value === "modify" ?
						"帖子修改成功" : "帖子创建成功"
					);
					console.log(info);
					
					uni.navigateBack();
					uni.showToast({
						icon: "success",
						title:  info
					});
				}
			 }
		});
	}
	
	function uploadFile(e) {
		uni.uploadFile({
			url: cfg.server + ":" +
				 cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.files.prefix + 
				 cfg.api.files.upload_file,
			filePath: e.tempFilePaths[0],
			name: 'file',
			success(res) {
				if(res.statusCode === 200) {
					const url_t = JSON.parse(res.data)[0]
								.path
								.split("\\")
					const url = "files\\\\".concat(url_t[1]);
					newPost.imgs.push({
						name: JSON.parse(res.data)[0].filename,
						url: url,
						extname: e.tempFiles[0].extname,
					});
				}
			}
		})
	}
	
	function removeFile(e) {
		newPost.imgs = newPost.imgs.filter(i => i.name !== e.tempFile.name);
		imgList.value = imgList.value.filter(i => i.name !== e.tempFile.name);
	}
	
	function doPost() {
		request();
	}
</script>

<style lang="scss">
	
</style>
