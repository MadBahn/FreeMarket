<template>
	<view class="content post">
		<view class="imgs">
			{{post.imgs}}
			<swiper circular >
				<swiper-item v-for="(i,index) in post.imgs">
					{{i}}
				</swiper-item>
			</swiper>
		</view>
		<view class="text">
			{{post.content}}
		</view>
		<uni-section
			id="comment" 
			titleFontSize="20px" 
			title="评论" 
			type="line" 
			class="content comments"
		>
			<commentInput @submit="getSubmit"/>
			<comment-display 
				:_data="post.comments" 
			/>
		</uni-section>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import commentInput from "../../components/comment_input/comment_input.vue";
	import commentDisplay from "../../components/comment_display/comment_display.vue";
	
	import cfg from "../../cfg.json";
	
	const app = getApp();
	
	const post = ref({});
	
	onLoad((option) => {
		console.log(option);
		uni.showNavigationBarLoading();
		request(option);
	});
	
	// 发表评论
	function getSubmit(c) {
		console.log(c);
	}
	
	// 请求帖子数据
	function request(data) {
		uni.request({
			url: cfg.server + ":" + cfg.port +
				 cfg.api.prefix +
				 cfg.api.post.prefix +
				 cfg.api.post.read_post,
			method: "POST",
			data: {
				post_id: data.id,
				userid: data.userid
			},
			// 只要能发起请求并得到服务器响应就算success
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					post.value = res.data.data;
					uni.setNavigationBarTitle({
						title: post.value.title
					});
				}
			},
			complete() {
				uni.hideNavigationBarLoading();
			}
		})
	}
	
</script>

<style lang="scss">
	.post {
		width: 100vw;
		align-items: flex-start;
	}
	.bottom-tab {
		position: fixed;
		bottom: 0;
		// height: 8vh;
	}
</style>
