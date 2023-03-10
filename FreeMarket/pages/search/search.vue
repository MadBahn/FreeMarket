<template>
	<view class="content">
		<view class="search-full-scale" @click="focusOn = false">
			<view class="search-btn" @click="doSearch(``, false, true)">搜索</view>
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
				<view @click="clearHistory">清空</view>
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
						@click="delHistory(i)"
					></uni-icons>
				</view>
			</view>
		</view>
		
		<view class="result" v-else>
			{{result}}
			<view>再怎么找也没有了</view>
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
	
	import cfg from "../../cfg.json";
	
	const type = ref("");
	// 搜索历史，存储于localStorage中
	const history = ref(["item1","item2","item itemi", "item3"]);
	
	// 搜索框内容
	const searchText = ref("");
	const isClear = ref(false);
	// 焦点是否在搜索框上
	const focusOn = ref(false);
	const start_at = ref(0);
	const result = ref([]);
	
	onLoad((option) => {
		type.value = option.type;
		operateHistory("w");
		// console.log("options:", type.value);
		// console.log(searchText.value.length, isClear.value);
	});
	
	function operateHistory(op: string) {
		console.log(op);

		// 从localStorage获取历史记录
		if (op === "r") {
			
		} else {
			// 写入localHistory
			if (op === "w"){
				// 遍历列表是否存在历史记录，如有则尝试移至第一处，否则添加
				console.log("w");
			}
			// 删除一个历史记录
			else if (op === "d") {
				console.log("d");
			}
			// 清空历史记录
			else if (op === "c") {
				console.log("c");
			}
			
			// uni.setStorage({
			// 	key: "history",
			// 	data: "{}"
			// });
			
		}
		
	}
	
	function onChange() {
		isClear.value = (searchText.value.length > 0);
	}
	
	function doSearch(txt: string, isItem: boolean, isNew: boolean) {
		const key = isItem ? txt : searchText.value;
		
		// 是否从搜索框发起请求
		if(isNew) start_at.value = 0;
		// 添加历史记录
		
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
					amount: 10
				}
			},
			success(res) {
				console.log(res);
				// 设置检索结果及索引值
				if(res.statusCode === 200) {
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
	
	function delHistory(i) {
		console.log("del");
		
		history.value = history.value.filter((_i) => _i !== i);
	}
	
	function clearHistory() {
		history.value = [];
		
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
		background-color: burlywood;
	}
</style>
