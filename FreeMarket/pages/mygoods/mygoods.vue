<template>
	<view>
		<view v-for="(i, index) in data" :key="index" class="items">
			{{i}}
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
	
	import cfg from "../../cfg.json";
	
	const data = ref([]);
	const end_index = ref(0);
	
	
	onLoad(() => {
		// 请求goods_display，使用owner查询
		request(false);
	});
	
	onPullDownRefresh(() => {
		request(true);
	});
	
	function request(type : boolean) {
		if(type) end_index.value = 0;
		const amount = 4;
		uni.request({
			url: cfg.server + ":" +
				 cfg.port + 
				 cfg.api.prefix +
				 cfg.api.goods.prefix + 
				 cfg.api.goods.goods_display,
			method: "POST",
			data: {
				filter: {
					start_at: end_index.value,
					amount: amount,
					owner: getApp().globalData.login.userid
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					data.value = res.data.data;
				}
			}
		})
	}
	
	
</script>

<style lang="scss">
	.items {
		margin-bottom: 1vh;
		border: 1px solid;
	}
</style>
