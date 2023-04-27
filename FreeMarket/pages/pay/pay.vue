<template>
	<view class="pay">
		<view>
			<text>待支付金额：</text>
			<text class="price">￥{{ price }}</text>
		</view>
		<view>
			<text>请选择支付方式：</text>
			<picker @change="pickerChange" :value="picker.index" :range="picker.array">
				{{ picker.array[picker.index]}}
			</picker>
		</view>
		<button @click="pay">支付</button>
	</view>
</template>

<script lang="ts" setup>
	import { ref, reactive } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import cfg from "@/cfg.json";
	
	const id = ref("");
	const price = ref(0);
	const picker = reactive({
		index: 0,
		array: ["支付宝", "微信", "云闪付"]
	});
	
	onLoad((option) => {
		id.value = option.id;
		price.value = option.price;
	});
	
	function pickerChange(e) {
		picker.index = e.target.value;
	}
	
	function pay() {
		// 调用第三方支付接口
		const third_party_pay = true;
		if(third_party_pay) {
			// 支付成功
			uni.request({
				url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.goods.prefix}${cfg.api.goods.pay_deal}`,
				method: "POST",
				data: {
					pay_form: {
						exchange_id: id.value,
						pay_method: picker.array[picker.index],
						price: price.value
					}
				},
				success(res) {
					if(res.statusCode === 200){
						uni.navigateBack();
						uni.showToast({
							icon: "success",
							title: "支付成功"
						});
					}
				}
			});
		}
	}
</script>

<style lang="scss" scoped>
	$w: 70vw;
	$h: 6vh;
	
	.pay {
		margin: 2vw;
		
		view {
			margin: 2vw;
		}
	}
	
	.price {
		font-weight: bold;
		color: red;
	}
	
	button {
		width: $w;
		height: calc($h * 1.5);
		line-height: calc($h * 1.5);
		border-radius: calc(($h * 1.5) / 2);
		margin-top: 1rem;
		background-color: $uni-color-primary;
		color: white;
	}
</style>
