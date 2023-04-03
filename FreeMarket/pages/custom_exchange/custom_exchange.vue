<template>
	<view>
		自定义交易
		
		<!-- 价格 price -->
		<PriceKeypad />
		<!-- 备注 addon-->
		<input />
		
	</view>
</template>

<script lang="ts" setup>
	import { ref, reactive } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import PriceKeypad from "@/components/price_keypad/price_keypad.vue";
	
	import cfg from "@/cfg.json";
	
	const exchange_data = reactive({});
	
	onLoad(() => {
		// 请求交易项，同时
		console.log(cfg);
	});
	
</script>

<style lang="scss">

</style>
