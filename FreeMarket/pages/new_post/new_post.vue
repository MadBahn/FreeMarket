<template>
	<view class="content">
		<view>
			<!-- 标题 -->
			<input placeholder="帖子标题"/>
			<!-- 正文 -->
			<textarea placeholder="正文"></textarea>
			<!-- 按钮 -->
			<button>发表</button>
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
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import cfg from "../../cfg.json";
	
	const imgList = ref([]);
	
	function request() {
		uni.request({
			url: cfg.server + ":" + cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.post.prefix + 
				 cfg.api.post.create_post,
			 method: "POST",
			 data: {
				 
			 },
			 success(res) {
			 	
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
				
			}
		})
	}
	
	function removeFile(e) {
		
	}
	
	function doPost() {
		
	}
</script>

<style lang="scss">
	
</style>
