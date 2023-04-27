<template>
	<view>
		<!-- 根据买卖方确定查询条件 -->
		<uni-segmented-control 
			:current="status_tab"
			:values="segItems"
			@clickItem="changeSeg"
			styleType="text"
		 />
		<view v-if="data.length !== 0">
			<uni-card 
				v-for="(e, i) in data"
				:title="(typeof(e._target) !== undefined) ? e._target.username : e._target" 
				is-full="true" 
				:extra="new Date(e.post_date).toLocaleString()"
				:thumbnail="`${(typeof(e._target) !== undefined) ? cfg.server+':'+cfg.port+'/'+e._target.headImg : cfg.default_avatar}`"
				@click="goto(e.exchange_id)"
			>
				<GoodsUnit :data="e.goods_snapshot" />
				<!-- 交易时间 -->
				<view>
					实际支付：
					<text style='font-weight: bold;color: red'>
						￥{{ e.price }}
					</text>
				</view>
				<button v-if="e.status !== -1 && e.status !== 3">取消</button>
			</uni-card>
			<no-more v-if="!enableBottomRequest" />
		</view>
		<empty v-else />
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad, onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
	
	import GoodsUnit from "@/components/goods_unit/goods_unit.vue"
	
	import cfg from "@/cfg.json";
	
	const side = ref("");
	const end_index = ref(0);
	// 通过切换标签控制请求数据
	const status_tab = ref(0);
	
	const segItems = ref(["已发起", "待支付", "待收货", "已完成", "已取消"]);
	const data = ref([]);
	const enableBottomRequest = ref(true);
	
	onLoad((option) => {
		console.log(option);
		side.value = option.type;
		request(true);
	});
	
	onPullDownRefresh(() => {
		request(true);
	});
	
	onReachBottom(() => {
		enableBottomRequest.value && request(false);
	});
	
	function request(type: boolean) {
		console.log(getApp().globalData.login.userid);
		if(type) end_index.value = 0;
		const amount = 4;
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.goods.prefix}${cfg.api.goods.get_deal}`,
			method: "POST",
			data: {
				userid: getApp().globalData.login.userid,
				filter: {
					isSeller: (side.value === "seller"),
					amount: amount,
					start_at: end_index.value,
					status: status_tab.value
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					// 是否启用页面底部加载之判定
					enableBottomRequest.value = 
						res.data.data.data.length === amount;
					end_index.value = res.data.data.next_index;
					// 如果下拉刷新则直接替换，否则添加至尾部
					data.value = type ? 
						res.data.data.data :
						data.value.concat(res.data.data.data);
					uni.stopPullDownRefresh();
				}
			}
		});
	}
	
	// 跳转至买卖家页面
	function goto(e: string) {
		const url = side.value === "buyer" ? "confirm_exchange" : "custom_exchange";
		uni.navigateTo({
			url: `/pages/exchange/${url}/${url}?id=${e}`
		});
	}
	
	function changeSeg(e) {
		console.log(e);
		status_tab.value = e.currentIndex;
		if(e.currentIndex === 4)
		// 与后端保持约定一致
			status_tab.value = -1;
		request(true);
	}
	
</script>

<style lang="scss">
	.item {
		border: 1px solid;
	}
	.goods_info {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		
		.img {
			$l: 15vh;
			width: $l;
			height: $l;
		}
	}
	
</style>
