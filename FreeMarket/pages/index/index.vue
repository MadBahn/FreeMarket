<template>
	<view class="content">
		<uni-nav-bar 
			leftIcon="plusempty" 
			@clickLeft="gotoNewGoods" 
			statusBar 
			fixed
		>
			<block v-slot:default>
				<view class="searchBox" @click="gotoSearch">
					<!-- flex-direction属性为row-reverse -->
					<view id="searchBtn">搜索</view>
					<text>search</text>
				</view>
			</block>
		</uni-nav-bar>
		
		<view class="random">
			<view 
				@click="gotoGoods(i)" 
				class="random-box" 
				v-for="(i, index) in hot_goods"
			>
				<image
					:src="`${cfg.server}:${cfg.port}/${i.imgs[0].url}`"
					class="pic"
					width="20"
					height="20"
				/>
				<text>￥ {{ i.price }} </text>
			</view>
		</view>
		<view class="list">
			<uni-card 
				:cover="cfg.server + `:` + cfg.port + `/` + i.imgs[0].url || ``" 
				class="uni-card-o" 
				@click="gotoGoods(i)" 
				v-for="(i, index) in goods" 
				:key="index"
			>
				<view>{{i.goods_name}}</view>
				<view 
					style="font-weight: bold;
						   font-size: 20px;
						   color: red;"
				>
					￥{{i.price}}
				</view>
			</uni-card>
		</view>
		<no-more v-if="!enableBottomRequest" />
	</view>
</template>

<script lang="ts" setup>
	// #ifndef APP-PLUS
	// @ts-ignore
	// import { io } from "@hyoga/uni-socket.io";
	// #endif
	
	// #ifdef APP-PLUS
	// @ts-ignore
	// import { io } from "socket.io-client";
	// #endif
	
	// json配置文件
	import cfg from "@/cfg.json";
	
	// 在组合式API中引入uni-app页面生命周期
	import { onLoad, onShow, onPullDownRefresh, onHide, onReachBottom } from "@dcloudio/uni-app";
	import { ref } from "vue";
	
	// 创建socket.io实例
	// const socket = io(cfg.server + ":" + cfg.port.toString(), {
	// 	transports: ["websocket"],
	// 	path: "/socket",
	// 	timeout: 5000
	// });
	
	const ctrl1 = ref(true);
	
	const app = getApp();
	
	const goods = ref([]);
	const hot_goods = ref([]);
	// 确定下一次请求时从哪儿开始
	const end_index = ref(0);
	const enableBottomRequest = ref(true);
	
	// 初始化时在socket.io实例上绑定事件
	onLoad(() => {
		// 获取商品数据
		request(true);
		hotGoods();
		console.log("globalData:",app.globalData);
		
		// if(socket){
		// 	console.log(socket.connected);
		// 	socket.on("connect", () => {
		// 		console.log(socket.id);
		// 		// 初始化
		// 		socket.emit("init");
		// 	});
		// 	socket.on("init", () => {
		// 		console.log("init on client");
		// 	});
		// }
	});
	
	// 切换页面时触发
	onShow(() => {
		console.log("onShow");
		ctrl1.value = true;
		console.log(ctrl1.value);
	});
	
	// 切换页面时触发
	onHide(() => {
		console.log("onHide");
		ctrl1.value = false;
		console.log(ctrl1.value);
	});
	
	// 滚动至底部时加载新数据
	onReachBottom(() => {
		console.log("reach bottom");
		enableBottomRequest.value && request(false);
	});
	
	onPullDownRefresh(() => {
		console.log("pull down refresh");
		hotGoods();
		request(true);
	});
	
	// 下拉刷新时，数据会被替换
	// 滚动至底部加载时，新数据数据会追加至现有数据的尾部
	
	function request(type : boolean) {
		// type表示是否为下拉刷新
		if(type) end_index.value = 0;
		const amount = 4;
		uni.request({
			url: "http://localhost:4000/api/goods/goods_display",
			method: "POST",
			data: {
				filter: {
					start_at: end_index.value,
					amount: amount,
					sub_filter: {}
				}
			},
			success(res) {
				console.log(res.data.data);
				if(res.statusCode === 200) {
					// 需要检查数据条数以决定是否禁用滚动底部请求
					enableBottomRequest.value = 
						res.data.data.data.length === amount;				
					goods.value = type ? 
						res.data.data.data : 
						goods.value.concat(res.data.data.data);
					
					end_index.value = res.data.data.next_index;
					console.log(end_index.value);
					uni.stopPullDownRefresh();
				}
				
				// console.log(goods.value, enableBottomRequest.value);
			}
		});
	}
	
	function hotGoods() {
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.goods.prefix}${cfg.api.goods.hot_goods}`,
			method: "POST",
			success(res) {
				if(res.statusCode === 200) {
					hot_goods.value = res.data;
				}
			}
		})
	}
	
	// 首页的商品数据
	function gotoGoods(i) {
		// console.log(i);
		uni.navigateTo({
			url: "/pages/browse_goods/browse_goods?id=" + i.goods_id +
			  "&userid=" + getApp().globalData.login.userid,
		});
	}
	
	// 搜索
	function gotoSearch() {
		// 默认查找商品
		uni.navigateTo({
			url: "/pages/search/search?type=goods",
			animationType: "none"
		})
	}
	
	function gotoNewGoods() {
		uni.navigateTo({
			url: "/pages/new_goods/new_goods?operation=new"
			// url: "/pages/new_goods/new_goods?operation=modify&goods_id=goods:0fc22747-88f7-434c-834f-7bf536ffca54"
		});
	}
</script>

<style scoped lang="scss">
	$w: 100vw;

	.navBar, .random, .list {
		width: $w;
	}
	
	.navBar {
		height: 6vh;
		padding-top: var(--status-bar-height);
		background-color: antiquewhite;
	}
	
	.random {
		height: 18vh;
		background-color: azure;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly;
		
		.random-box {
			width: 14vh;
			height: 16vh;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			
			.pic {
				width: 12vh;
				height: 12vh;
				background-color: beige;
			}
			
			text {
				width: 12vh;
				text-align: left;
				font-weight: bold;
				font-size: 20px;
				color: red;
			}
		}
	}
	
	.list {
		min-height: 80vh;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		// align-items: center;s
		justify-items: flex-start;
		justify-content: space-between;
		
		.uni-card-o {
			margin: 0;
			padding: 0;
			width: 50vw;
			// height: 20vh;
			view {
				// min-height: 30vh;
			}
			image {
				// height: 10vh;
				width: 100%;
				background-color: $uni-bg-color-grey;
			}
		}
	}
	
</style>
