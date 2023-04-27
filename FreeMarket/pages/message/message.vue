<template>
	<view class="content main">
		<uni-list class="main" v-if="isLogin">
			<uni-list-item 
				:showExtraIcon="true"
				:extraIcon="{
					color: '#0055ff',
					size: '30',
					type: 'shop'
				}"
				@click="goto(`/pages/msg_detail/msg_detail?type=goods`)" 
				clickable="true" 
				title="商品消息"
				:note="msg.goods ? msg.goods.content : no_msg"
				:rightText="msg.goods ? new Date(msg.goods.post_date).toLocaleString() : no_msg"
			/>
			<uni-list-item 
				:showExtraIcon="true"
				:extraIcon="{
					color: '#0055ff',
					size: '30',
					type: 'compose'
				}"
				@click="goto(`/pages/msg_detail/msg_detail?type=post`)" 
				clickable="true" 
				title="帖子消息" 
				:note="msg.post ? msg.post.content : no_msg"
				:rightText="msg.post ? new Date(msg.post.post_date).toLocaleString() : no_msg"
			/>
			<uni-list-item 
				:showExtraIcon="true"
				:extraIcon="{
					color: '#0055ff',
					size: '30',
					type: 'cart'
				}"
				@click="goto(`/pages/msg_detail/msg_detail?type=exchange`)" 
				clickable="true" 
				title="交易消息" 
				:note="msg.exchange ? msg.exchange.content : no_msg"
				:rightText="msg.exchange ? new Date(msg.exchange.post_date).toLocaleString() : no_msg"
			/>
			<uni-list-item 
				:showExtraIcon="true"
				:extraIcon="{
					color: '#0055ff',
					size: '30',
					type: 'person'
				}"
				@click="goto(`/pages/msg_detail/msg_detail?type=user`)" 
				clickable="true" 
				title="账号消息" 
				:note="msg.user ? msg.user.content : no_msg"
				:rightText="msg.user ? new Date(msg.user.post_date).toLocaleString() : no_msg"
			/>
		</uni-list>
		<view v-else>
			你还没有登录欸，快去登录吧。
			<button @click="goto(`/pages/login/login`)">登录</button>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
	// #ifndef APP
	import io from "@hyoga/uni-socket.io";
	// #endif
	
	// #ifdef APP
	import { io } from "socket.io-client";
	// #endif
	
	import cfg from "@/cfg.json";
	
	const msg = ref([]);
	const isLogin = ref(false);
	const no_msg = ref("当前没有消息");
	
	const socket = io(`${cfg.server}:${cfg.port}`, {
		transports: ["websocket", "po"],
		path: "/socket",
		timeout: 5000
	});
	
	onLoad(() => {
		if(getApp().globalData.login) isLogin.value = true;
		Socket();
	});
	
	onPullDownRefresh(() => {
		// 请求最新消息
		getMsg(getApp().globalData.login.userid);
	});
	
	// 当用户登录时，注册socket.io
	uni.$on("user", () => {
		isLogin.value = true;
		socket.connect();
		socket.emit("init", {
			type: "client",
			user: getApp().globalData.login.userid
		});
	});
	// 当用户登出时，注销socket.io
	uni.$on("logout", () => {
		isLogin.value = false;
		socket.disconnect();
	});
	
	function Socket() {
		console.log("onLoad");
		console.log(socket);
		// 检查登录数据
		if(socket && getApp().globalData.login){
			console.log(socket.connected);
			socket.on("connect", () => {
				console.log(socket.id);
				// 初始化
				socket.emit("init", {
					type: "client",
					user: getApp().globalData.login.userid
				});
				// 监听当前用户消息
				socket.emit("msg");
				socket.on("new_msg", (e) => {
					// 接收后排序
					if(e.userid === getApp().globalData.login.userid)
						getMsg(e.userid);
				});
			});
			socket.on("init", () => {
				console.log("init on client");
			});
		}
	}
	
	function getMsg(e: string) {
		console.log("get msg", e);
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.user.prefix}${cfg.api.user.get_msg}`,
			method: "POST",
			data:{
				userid: e
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					msg.value = res.data.data;
					
					console.log(msg.value);
				}
			}
		});
	}
	
	function goto(url: string) {
		uni.navigateTo({
			url: url
		});
	}
	
</script>

<style lang="scss">
	.main {
		margin-top: 3vh;
		width: 100vw;
		height: 100vh;
	}
</style>
