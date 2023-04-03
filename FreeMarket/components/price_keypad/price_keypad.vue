<template>
	<view class="price-input">
		<view class="display">
			价格：￥{{price_str}}
		</view>
		<view class="keyboard">
			<view class="number">
				<button @click="keyboard(`7`)">7</button>
				<button @click="keyboard(`8`)">8</button>
				<button @click="keyboard(`9`)">9</button>
				<button @click="keyboard(`4`)">4</button>
				<button @click="keyboard(`5`)">5</button>
				<button @click="keyboard(`6`)">6</button>
				<button @click="keyboard(`1`)">1</button>
				<button @click="keyboard(`2`)">2</button>
				<button @click="keyboard(`3`)">3</button>
				<button @click="keyboard(`<`)"><uni-icons type="left"></uni-icons></button>
				<button @click="keyboard(`0`)">0</button>
				<button @click="keyboard(`.`)">.</button>
			</view>
			<view class="action">
				<button @click="keyboard(`clear`)">清除</button>
				<button @click="keyboard(`ok`)">确定</button>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	
	const emits = defineEmits(['changePrice']);
	// 
	const props = defineProps({
		"price": Number
	});
	
	const price_str = ref(props.price.toString());
	
	function keyboard(input: string) {
		console.log(input);
		// 转化为字符串
		// let str = newGoods.value.price.toString();
		// console.log(str);
		switch(input) {
			// 清除
			case "clear": {
				price_str.value = "0";
				break;
			}
			// 退格
			case "<": {
				price_str.value = 
					price_str.value.slice(0,price_str.value.length - 1);
				console.log(price_str.value.length);
				console.log(0,price_str.value.length - 1)
				console.log(price_str.value);
				
				if(price_str.value.length === 0) price_str.value = "0";
				break;
			}
			case "ok": {
				const tmp = price_str.value.split(".");
				if(tmp.length === 2 && tmp[1].length > 2) {
					tmp[1] = tmp[1].slice(0,2);
					price_str.value = tmp[0].concat(".".concat(tmp[1]));
				}
				// newGoods.value.price = price_str.value * 1;
				// pricePopup.value.close();
				break;
			}
			// 数字和小数点
			default: {
				if(price_str.value === "0") {
					if(input === ".") price_str.value += input;
					else price_str.value = input;
				}
				else {
					price_str.value = price_str.value.concat(input);
					if(input === "."){
						const regex = /[.]/g;
						const dict = price_str.value.match(regex);
						console.log(dict);
						// 不能有二个（含）以上的小数点
						console.log(dict.length);
						if(dict && dict.length > 1) 
							price_str.value =
								price_str.value.slice(0,price_str.value.length - 1);
					}
				}
				
				console.log(price_str.value);
				break;
			}
		}
		// newGoods.value.price = price_str.value * 1.0;
	}
	
</script>

<style lang="scss">
	.price-input {
		background-color: white;
		width: 100vw;
		height: 40vh;
		display: flex;
		flex-direction: column;
		
		.display {
			padding: 2vh;
		}
		
		.keyboard {
			display: flex;
			flex-direction: row;
			// height: 52vh;
			.number {
				// flex: 0 0 1;
				display: flex;
				flex-wrap: wrap;
				width: 75vw;
				// height: 40vh;
				
				button {
					$buttonHeight: 8vh;
					margin: 0;
					width: 25vw;
					height: $buttonHeight;
					line-height: $buttonHeight;
				}
			}
			
			.action {
				width: 25vw;
				display: flex;
				flex-direction: column;
				
				button {
					width: 100%;
					height: 16vh;
					line-height: 16vh;
				}
			}
		}
	}
</style>