<template>
	<view>
		<text>￥{{ price }}</text>
		请选择支付方式：
		<picker @change="pickerChange" :value="picker.index" :range="picker.array">
			{{ picker.array[picker.index]}}
		</picker>
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
		const third_party_pay = true;
		if(third_party_pay) {
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
</style>
