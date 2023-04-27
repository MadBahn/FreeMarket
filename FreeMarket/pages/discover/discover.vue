<template>
	<view class="content">
		<uni-nav-bar 
			leftIcon="plusempty" 
			@clickLeft="goto(`/pages/new_post/new_post`)" 
			statusBar 
			fixed
		>
			<block v-slot:default>
				<view 
					class="searchBox" 
					@click="goto(`/pages/search/search?type=post`)"
				>
					<!-- flex-direction属性为row-reverse -->
					<view id="searchBtn">搜索</view>
					<text>search</text>
				</view>
			</block>
		</uni-nav-bar>
		<view class="data">
			<uni-card 
				v-for="(i, index) in posts"
				@click="goto(`/pages/browse_post/browse_post?id=` + 
							  i.post_id + 
							  `&userid=` + 
							  appData.login.userid)"
				:cover="cfg.server + ':' + cfg.port + '/' + i.imgs[0].url"
			>
				<text>{{i.title}}</text>
			</uni-card>
			<no-more v-if="!enableBottomRequest" />
		</view>
	</view>
</template>

<script lang="ts" setup>
	// 				:cover="cfg.server + `:` + cfg.port + `/` + i.imgs[0].url || ``"
	import { onLoad, onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
	import { ref } from "vue";
	
	import cfg from "../../cfg.json";
	
	const appData = getApp().globalData;
	
	const posts = ref([]);
	
	// 确定下一次请求时从哪儿开始
	const end_index = ref(0);
	const enableBottomRequest = ref(true);
	
	onPullDownRefresh(() => {
		request(true);
	});
	
	onReachBottom(() => {
		enableBottomRequest.value && request(false);
	});
	
	onLoad(() => {
		console.log("load");
		request(true);
	});
	
	function request(type : boolean) {
		if(type) end_index.value = 0;
		const amount = 4;
		uni.request({
			url: cfg.server + ":" + cfg.port +
				 cfg.api.prefix + 
				 cfg.api.post.prefix + 
				 cfg.api.post.post_display,
			method: "POST",
			data: {
				filter: {
					start_at: end_index.value,
					amount: amount,
					sub_filter: {}
				}
			},
			success(res) {
				console.log(res.data);
				if(res.statusCode === 200) {
					enableBottomRequest.value = 
						res.data.data.length === amount;
					posts.value = type ? res.data.data : posts.value.concat(res.data.data);
					end_index.value = res.data.next_index;
					uni.stopPullDownRefresh();
				}
				
			}
		})
		
	}
	
	function goto(url) {
		uni.navigateTo({
			url: url,
			animationType: "none"
		})
	}
	
	function gotoSearch() {
		uni.navigateTo({
			// 默认查找帖子
			url: "/pages/search/search?type=posts",
			animationType: "none"
		})
	}
	
</script>

<style scoped lang="scss">
	$w: 100vw;
	
	.A, .data {
		width: $w;
	}
	.A{
		height: 10vh;
		background-color: aqua;
	}
	.data{
		height: 100vh;
		// background-color: beige;
	}
</style>
