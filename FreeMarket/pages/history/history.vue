<template>
	<view>
		<uni-segmented-control
			class="segs"
			:current="current"
			styleType="text"
			:values="segItems"
			@clickItem="switchSegments"/>
		<view 
			class="items" 
			v-for="(i, index) in data" 
			:key="index"
		>
			{{i}}
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad, onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
	
	import cfg from "../../cfg.json";
	
	const data = ref([]);
	const start_at = ref(0);

	const type = ref("goods");
	const current = ref(0);
	const segItems = ref(["商 品", "帖 子"]);
	
	onLoad(() => {
		request(true);
	});
	
	onPullDownRefresh(() => {
		request(true);
	});
	
	onReachBottom(() => {
		request(false);
	});
	
	function switchSegments(e) {
		console.log(e);
		current.value = e.currentIndex;
		// 0为商品，1为帖子
		if(current.value === 0) type.value = "goods";
		else if(current.value === 1) type.value = "post";
		// 
	}
	
	function request(type : boolean) {
		const count = 5;
		
		if(type) start_at.value = 0;
		
		uni.request({
			url: cfg.server + ":" +
				 cfg.port +
				 cfg.api.prefix + 
				 cfg.api.user.prefix + 
				 cfg.api.user.get_history,
			method: "POST",
			data: {
				filter: {
					userid: getApp().globalData.login.userid,
					start_at: start_at.value,
					count: count
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					// 根据type变量决定重写data或追加至data末尾
					if(type) data.value = res.data.data;
					else {
						data.value = data.value.concat(res.data.data);
						start_at.value = res.data.next_index;
					}
				}
			},
			complete() {
				uni.stopPullDownRefresh();
			}
		})
	}
	
	
</script>

<style lang="scss">
	.segs {
		width: 30vw;
	}
	
	.items {
		margin-bottom: 1vh;
		border: 1px solid;
	}
</style>
