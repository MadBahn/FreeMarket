<template>
	<view>
		<!-- 买方 -->
		
		<!-- 商品信息 -->
		<GoodsUnit :data="exchange_data.goods_snapshot"/>
		<!-- 价格 price -->
		<view>
			<view style="padding: 1vh;width: 98vw;display:flex;flex-direction: row;justify-content: space-between;">
				<text>实付价格</text>
				<text style='font-weight: bold;color: red'>￥ {{ exchange_data.price }}</text>
			</view>
			
			<button v-if="exchange_data.status===0" @click="showKeypad">修改价格</button>
		</view>
		<!-- 备注 addon-->
		<input v-model="exchange_data.desc" style="height: 10vh;" placeholder="备注"/>
		<!-- 支付方式 -->
		<picker 
			style="margin: 2vh;" 
			@change="pickerChange" 
			:value="pay_option.index" 
			:range="pay_option.array"
		>
			支付选项：{{ pay_option.array[pay_option.index] }}
		</picker>
		<view v-if="exchange_data.status === 0">
			<button @click="confirmChange(0, false)">暂存</button>
			<button @click="confirmChange(1, true)">继续</button>
		</view>
		
		
		<uni-popup v-if="exchange_data.status===0" ref="keypad" type="bottom">
			<PriceKeypad :price="exchange_data.price" @changePrice="changePrice"/>
		</uni-popup>
	</view>
</template>

<script lang="ts" setup>
	import { ref, reactive } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import PriceKeypad from "@/components/price_keypad/price_keypad.vue";
	import GoodsUnit from "@/components/goods_unit/goods_unit.vue";
	
	import cfg from "@/cfg.json";
	
	const exchange_data = ref({
		exchange_id: "",
		price: 0
	});
	// 如有修改，未保存退出时弹出提示框
	const hasChanged = ref(false);
	const keypad = ref(null);
	
	const pay_option = reactive({
		index: 0,
		array: ["线上支付", "卖家确认"],
	});
	
	onLoad((option) => {
		// 请求交易项，同时
		// console.log(option);
		loadGoods(option.id);
	});
	
	// 加载商品信息和交易信息
	function loadGoods(id: string) {
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.goods.prefix}${cfg.api.goods.deal_info}`,
			method: "POST",
			data:{
				exchange_id: id,
				type: "buyer"
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					exchange_data.value = res.data.data;
				}
			}
		});
	} 
	
	// 修改
	function confirmChange(action: Number, proceed: boolean) {
		// 如果敲定细节，可定为待支付，否则暂存
		
		if(action === 1){
			if(pay_option.index === 1) {
				uni.showModal({
					title: "三思而后行",
					content: "请确保与买家协调好，避免造成您的经济损失",
					success(e) {
						if(e.cancel) return;
						else confirmContinue(action, proceed);
					}
				});
			} else {
				confirmContinue(action, proceed);
			}
		} else {
			confirmContinue(action, proceed);
		}
		// 0-已发起，1-待支付，2-待收货，3-已完成，-1已取消
		
	}
	
	function confirmContinue(action: Number, proceed: boolean) {
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.goods.prefix}${cfg.api.goods.proceed_deal}`,
			method: "POST",
			data: {
				proceed_form: {
					action: action,
					exchange_id: exchange_data.value.exchange_id,
					isProceed: proceed,
					setter: exchange_data.value,
					pay: pay_option.array[pay_option.index]
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					uni.navigateBack();
					if(action === 1) {
						uni.showToast({
							icon: "success",
							title: "交易正式确认了"
						});
					} else {
						uni.showToast({
							icon: "success",
							title: "交易已暂存"
						});
					}
				}
			}
		});
	}
	
	function showKeypad() {
		keypad.value.open();
	}
	
	function changePrice(p: string) {
		exchange_data.value.price = 1.0 * p;
		keypad.value.close();
	}
	
	function pickerChange(e) {
		pay_option.index = e.detail.value;
	}
	
</script>

<style lang="scss">

</style>
