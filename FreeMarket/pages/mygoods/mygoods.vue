<template>
	<view>
		<view v-for="(i, index) in data" :key="index" class="items">
			<!-- {{i}} -->
			<GoodsUnit :data="i" />
			<button @click="gotoMod(i.goods_id)">修改</button>
			<button @click="delGoods(i.goods_id)">删除</button>
		</view>
		<no-more v-if="!enableBottomRequest" />
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad, onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
	
	import GoodsUnit from "@/components/goods_unit/goods_unit.vue";
	
	import cfg from "@/cfg.json";
	
	const data = ref([]);
	const end_index = ref(0);
	const enableBottomRequest = ref(true);
	
	onLoad(() => {
		// 请求goods_display，使用owner查询
		request(true);
	});
	
	onPullDownRefresh(() => {
		request(true);
	});
	
	onReachBottom(() => {
		enableBottomRequest.value && request(false);
	});
	
	function request(type : boolean) {
		console.log(getApp().globalData.login.userid);
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
					sub_filter: {
						owner: getApp().globalData.login.userid
					}
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					data.value = type ? 
						res.data.data.data : 
						data.value.concat(res.data.data.data);
					enableBottomRequest.value = (res.data.data.data.length === res.data.data.next_index);
					end_index.value = res.data.data.next_index;
				}
			}
		})
	}
	
	async function delGoods(id: string) {
		const r = await uni.showModal({
			title: "警告",
			content: "是否继续？"
		});
		console.log(r);
		// @ts-ignore
		r.confirm && uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.goods.prefix}${cfg.api.goods.remove_goods}`,
			method: "POST",
			data: {
				goods_id: id,
				userid: getApp().globalData.login.userid
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					data.value = data.value.filter(i => i.goods_id !== id);
				}
			}
		});
	}
	
	function gotoMod(id: string) {
		uni.navigateTo({
			url: `/pages/new_goods/new_goods?operation=modify&goods_id=${id}`
		});
	}
	
</script>

<style lang="scss">
	.items {
		margin-bottom: 1vh;
		border: 1px solid #c2c2c2;
		border-radius: 10px;
		
		button {
			margin: 2vw;
		}
	}
</style>
