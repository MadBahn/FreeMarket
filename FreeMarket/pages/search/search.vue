<template>
	<view class="content">
		<view class="search-full-scale" @click="focusOn = false">
			<view class="search-btn" @click="doSearch(searchText, false, true)">搜索</view>
			<uni-icons 
				@click="clearText" 
				v-show="isClear" 
				type="clear" 
				size="4vh"
			></uni-icons>
			<input 
				@input="onChange" 
				auto-focus="true" 
				v-model="searchText" 
				placeholder="search"/>
			<uni-icons type="search" size="4vh"></uni-icons>
		</view>
		<view v-if="!focusOn">
			<view class="option">
				<view>历史记录</view>
				<view @click="operateHistory('c', null, 0)">清空</view>
			</view>
			<view class="history">
				<view 
					class="history-item" 
					v-for="(i, index) in history" 
					:key="index"
				>
					<view @click="doSearch(i, true, true)">{{i}}</view>
					<uni-icons 
						type="close" 
						class="item-close" 
						@click="operateHistory('d', i, index)"
					></uni-icons>
				</view>
			</view>
		</view>
		
		<view class="result" v-else>
			<view v-if="result.length !== 0">
				<view class="unit" v-for="(i,index) in result">
					<GoodsUnit v-if="type==='goods'" :data="i"/>
					<PostUnit v-else :data="i"/>
				</view>
				<no-more v-if="!enableBottomRequest" />
			</view>
			<empty v-else/>
		</view>
	</view>
</template>

<script lang="ts" setup>
	/*
	storage:
	1.goods
	2.posts
	根据option读取
	*/
	
	import { onLoad, onReachBottom } from "@dcloudio/uni-app";
	import { ref } from "vue";
	
	import GoodsUnit from "@/components/goods_unit/goods_unit.vue";
	import PostUnit from "@/components/post_unit/post_unit.vue";
	
	import cfg from "@/cfg.json";
	
	const type = ref("");
	// 搜索历史，存储于localStorage中
	const history = ref();
	
	// 搜索框内容
	const searchText = ref("");
	const isClear = ref(false);
	// 焦点是否在搜索框上
	const focusOn = ref(false);
	const start_at = ref(0);
	const result = ref([]);
	
	const enableBottomRequest = ref(true);
	
	onLoad((option) => {
		type.value = option.type;
		operateHistory("r", null, 0);
	});
	
	onReachBottom(() => {
		doSearch(searchText.value, false, false);
	});
	
	function operateHistory(op: string, i: any, index: number) {
		console.log(index);

		// 从localStorage获取历史记录
		if (op === "r") {
			history.value = JSON.parse(uni.getStorageSync("history"));
		} else {
			// 写入localHistory
			if (op === "w"){
				// 遍历列表是否存在历史记录，如有则尝试移至第一处，否则添加
				// console.log("w");
				if(i === "") return;
				console.log(history.value.includes(i));
				if(history.value.includes(i)) {
					history.value.filter(j => j !== i);
				}
				
				console.log(history.value);
				// push到末尾
				history.value.push(i);
				
				console.log(history.value);
				
				// 交换数组位置
				let tmp = history.value[0];
				const last_index = history.value.indexOf(i);
				
				history.value[0] = i;
				history.value[last_index] = tmp;
				
				
				
				console.log(history.value);
			}
			// 删除一个历史记录
			else if (op === "d") {
				// console.log("d");
				history.value = history.value.splice(index, 1);
			}
			// 清空历史记录
			else if (op === "c") {
				// console.log("c");
				history.value = [];
			}
			
			console.log("setStorage");
			uni.setStorageSync("history",JSON.stringify(history.value));
			
		}
		
		console.log(history.value);
		
	}
	
	function onChange() {
		isClear.value = (searchText.value.length > 0);
	}
	
	function doSearch(txt: string, isItem: boolean, isNew: boolean) {
		const key = isItem ? txt : searchText.value;
		const amount = 2;
		
		// 是否从搜索框发起请求
		if(isNew) start_at.value = 0;
		// 添加历史记录
		operateHistory("w", txt, 0);
		
		// 检索请求
		uni.request({
			url: cfg.server + ":" + cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.user.prefix + 
				 cfg.api.user.search,
			method: "POST",
			data: {
				search_form: {
					keyword: key,
					type: type.value,
					start_at: start_at.value,
					amount: amount
				}
			},
			success(res) {
				console.log(res);
				// 设置检索结果及索引值
				if(res.statusCode === 200) {
					enableBottomRequest.value = res.data.data.length === amount;
					start_at.value = res.data.next_index;
					result.value = res.data.data;
					focusOn.value = true;
					console.log(result.value);
				}
			}
		});
	}
	
	function clearText() {
		searchText.value = "";
		isClear.value = false;
	}
	
	function goto(url: string) {
		
	}
</script>

<style lang="scss">
	$w: 95vw;
	.search-full-scale, .history, .result {
		width: $w;
	}
	
	.search-full-scale {
		$h: 6vh;
		$radius: calc($h / 2);
		height: $h;
		border: $uni-border-color 1px solid;
		border-radius: $radius;
		line-height: $h;
		display: flex;
		flex-flow: row-reverse;
		justify-content: space-evenly;
		
		.search-btn {
			width: 20vw;
			background-color: $uni-color-primary;
			color: white;
			text-align: center;
			border-radius: $radius;
		}
		
		input {
			height: $h;
			line-height: $h;
			flex: 1 1 0%;
			margin: 0 1.5vw;
		}
		
		uni-icons {
			margin-left: 2vw;
		}
	}
	
	.option {
		width: 95vw;
		height: 4vh;
		padding: 1vh 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.history {
		max-height: 30vh;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		
		$s: 4vh;
		
		.history-item {
			height: $s;
			margin-top: 1vh;
			margin-right: 2vw;
			padding: 1vw;
			border-radius: calc($s / 2);
			background-color: azure;
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			
			// 删除按钮
			.item-close {
				width: $s;
				height: $s;
				margin-left: 1vw;
				border-radius: 50%;
				background-color: white;
			}
		}
		
	}
	
	.result {
		height: 80vh;
		
		// .unit {
		// 	margin: 2vh;
		// 	padding: 2vh;
			
		// 	border: 1px #dadada solid;
		// 	border-radius: 15px;
		// }
	}
</style>
