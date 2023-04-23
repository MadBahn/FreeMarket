<template>
	<view>
		<!-- {{ data }} -->
		<view class="seller">
			<view 
				class="head_img"
				:style="{
					backgroundImage: `url(${cfg.server}:${cfg.port}/${data._target.headImg}`
			}"></view>
			<!-- {{ data._target.headImg }} -->
			<view class="info">
				<text>{{ data._target.username }}</text>
				<text style="font-size: 13px;color: #a2a2a2;">{{ new Date(data.post_date).toLocaleString() }}</text>
			</view>
		</view>
		<view>
			<GoodsUnit :data="data.goods_snapshot"/>
		</view>
		<view>
			<text>
				实付：
				<text>
					￥{{ data.price }}
				</text>
			</text>
		</view>
		<view>
			<uni-steps :options="steps.list" :active="steps.active"/>
		</view>
		<view>
			<view v-if="data.status === 1">
				<!-- 选择支付方式 -->
				<button @click="gotoPay">支付</button>
			</view>
			<view v-if="data.status === 2">
				<!-- 确认收货 -->
				<button @click="finishDeal()">确认收货</button>
			</view>
			<view v-if="data.status !== 3 && data.status !== -1">
				<!-- 确认收货 -->
				<button @click="cancelDeal()">取消订单</button>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import {reactive, ref} from "vue";
	import {onLoad} from "@dcloudio/uni-app";
	
	import GoodsUnit from "@/components/goods_unit/goods_unit.vue";
	
	import cfg from "@/cfg.json";
	
	const data = ref({});
	
	const steps = reactive({
		active: 0,
		list: [{
			title: "已发起"
		},{
			title: "待付款"
		},{
			title: "待收货"
		},{
			title: "已完成"
		}]
	})
	
	onLoad((option) => {
		request(option.id);
	});
	
	// 获取交易的详细信息
	function request(id: string) {
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.goods.prefix}${cfg.api.goods.deal_info}`,
			method: "POST",
			data: {
				exchange_id: id,
				type: "seller"
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					data.value = res.data.data;
					steps.active = data.value.status;
				}
			}
		});
	}
	
	function finishDeal() {
		// 如果敲定细节，可定为待支付，否则暂存
		
		// 0-已发起，1-待支付，2-待收货，3-已完成，-1已取消
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.goods.prefix}${cfg.api.goods.finish_deal}`,
			method: "POST",
			data: {
				finish_form: {
					exchange_id: data.value.exchange_id
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					uni.navigateBack();
					uni.showToast({
						icon: "success",
						title: "交易完成"
					});
				}
			}
		});
	}
	
	function cancelDeal() {
		
	}
	
	function gotoPay() {
		uni.navigateTo({
			url: `/pages/pay/pay?id=${data.value.exchange_id}&price=${data.value.price}`
		});
	}
</script>

<style lang="scss" scoped>
	.seller {
		display: flex;
		flex-direction: row;
		align-items: center;
		
		.head_img {
			margin-left: 2vw;
			width: 12vw;
			height: 12vw;
			
			border-radius: 50%;
			
			background-position: center;
			background-repeat: no-repeat;
			background-size: cover;
		}
		
		.info {
			margin-left: 2vw;
			display: flex;
			flex-direction: column;
		}
	}
	
</style>
