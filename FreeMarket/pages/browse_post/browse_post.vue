<template>
	<view class="content post">
		<view style="display: flex;flex-direction: row;">
			<view class="post-by-info" @click="gotoInfo(post.post_by.userid)">
				<image :src="cfg.server + `:` +
							 cfg.port + `/` +
							 post.post_by.headImg || cfg.default_avatar" class="avatar">
				</image>
				<view class="info">
					<text class="username">{{ post.post_by.username }}</text>
					<text class="post-date">{{ new Date(post.post_date).toLocaleString() }}</text>
				</view>
			</view>
			<view>
				<uni-icons
					color="#1296db"
					size="40" 
					:type="post.isFavorite ? 'star-filled' : 'star'" 
					@click="favorite"
				></uni-icons>
			</view>
		</view>
		<view class="imgs">
			<!-- {{post.imgs}} -->
			<swiper circular indicator-dots="true">
				<swiper-item :item-id="index" v-for="(i,index) in post.imgs">
					<!-- {{i}} -->
					<image :src=
						"cfg.server + ':' + cfg.port + '/' + i.url"
					></image>
				</swiper-item>
			</swiper>
		</view>
		<view class="text">
			{{post.content}}
		</view>
		<view>
			<commonReport @call="call_post"/>
		</view>
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
			@report="call_report"
		/>
	</uni-section>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import commentInput from "@/components/comment_input/comment_input.vue";
	import commentDisplay from "@/components/comment_display/comment_display.vue";
	import commonReport from "@/components/common_report/common_report.vue";
	
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
		// console.log(c);
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.user.prefix}${cfg.api.user.create_comment}`,
			method: "POST",
			data: {
				comment_form: {
					content: c,
					comment_to: post.value.post_id,
					comment_by: getApp().globalData.login.userid
				}
			},
			success(res) {
				if(res.statusCode === 200) {
					// 解决评论后显示id之问题
					const t = res.data;
					t.comment_by = getApp().globalData.login;
					post.value.comments.push(t);
				}
			}
		})
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
				console.log(res.data.data);
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
		});
	}
	
	function favorite() {
		uni.request({
			url: cfg.server + ":" +
				 cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.user.prefix + 
				 cfg.api.user.favorite,
			method: "POST",
			data: {
				favorite_form: {
					userid: getApp().globalData.login.userid,
					refer_to: post.value.post_id
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					uni.showToast({
						icon: "success",
						title: res.data.msg
					});
					post.value.isFavorite = 
						!post.value.isFavorite;
				}
			}
		})
	}
	
	function call_post() {
		call_report(post.value.post_id);
	}
	
	function call_report(id) {
		uni.navigateTo({
			url: `/pages/report/report?refer_to=${id}&report_by=${getApp().globalData.login.userid}`
		});
	}
	
	function gotoInfo(id: string) {
		uni.navigateTo({
			url: `/pages/info/info?id=${id}`
		});
	}
	
</script>

<style lang="scss">
	.post {
		width: 100vw;
		align-items: flex-start;
	}
	.post-by-info {
		height: 8vh;
		margin-bottom: 1vh;
		display: flex;
		flex-direction: row;
		align-items: center;
		
		.avatar {
			$scale: 13vw;
			width: $scale;
			height: $scale;
			margin-left: 3vw;
			border-radius: 50%;
		}
		.info {
			width: 70vw;
			height: 8vh;
			margin-left: 2vw;
			display: flex;
			flex-direction: column;
			justify-content: space-evenly;
			
			.username {
				font-size: 4.5vw;
			}
			
			.post-date {
				font-size: 3vw;
				color: #b3b4b9;
			}
		}
	}
	.bottom-tab {
		position: fixed;
		bottom: 0;
		// height: 8vh;
	}
	.imgs {
		width: 100vw;
		min-height: 30vh;
		
		swiper {
			width: 100%;
			min-height: 30vh;
			
			swiper-item {
				width: 100%;
				min-height: 30vh;
			}
		}
	}
</style>
