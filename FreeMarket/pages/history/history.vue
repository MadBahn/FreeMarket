<template>
	<view>
		<uni-segmented-control
			class="segs"
			:current="current"
			styleType="text"
			:values="segItems"
			@clickItem="switchSegments"
		/>
		<view 
			class="items" 
			v-for="(i, index) in data" 
			:key="index"
		>
			<history-unit :type="type" :data="i"/>
		</view>
		<view v-show="!enableBottomRequest">再怎么找也没有了</view>
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
	const enableBottomRequest = ref(true);
	
	onLoad(() => {
		request(true);
	});
	
	onPullDownRefresh(() => {
		request(true);
	});
	
	onReachBottom(() => {
		enableBottomRequest.value && request(false);
	});
	
	function switchSegments(e) {
		
		current.value = e.currentIndex;
		// 0为商品，1为帖子
		if(current.value === 0) type.value = "goods";
		else if(current.value === 1) type.value = "post";
		// 
		console.log(type.value);
		request(true);
	}
	
	function request(start_type : boolean) {
		const count = 5;
		
		if(start_type) start_at.value = 0;
		
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
					type: type.value,
					query: {
						userid: getApp().globalData.login.userid,
						// 需要在获取结果前找全所有的数据
						history_to: type.value
					},
					start_at: start_at.value,
					count: count
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					
					enableBottomRequest.value =
						res.data.data.length === count;
					
					// 根据type变量决定重写data或追加至data末尾
					if(start_type) data.value = res.data.data;
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

<style lang="scss" scoped>
	.segs {
		width: 30vw;
	}
	
	
</style>
