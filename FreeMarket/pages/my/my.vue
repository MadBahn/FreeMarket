<template>
	<view class="content">
		<view class="content info">
			<view class="avatar l-side" :style="{ backgroundImage: `url(`+ info.headImg +`)` }" @click="gotoEditInfo">
			</view>
			<view class="r-side">
				<view v-if="isLogin">
					<view class="username">{{info.username}}</view>
					<view class="desc">{{info.desc}}</view>
				</view>
				<view v-else>
					<button @click="goto(`/pages/login/login`)">登录</button>
				</view>
			</view>
		</view>
		<view class="views">
			<view class="menu-items" @click="goto(`/pages/favorite/favorite`)">
				<uni-icons 
					size="35" 
					customPrefix="iconfont" 
					type="icon-favor"
				></uni-icons>
				<text>我的收藏</text>
			</view>
			<view class="menu-items" @click="goto(`/pages/history/history`)">
				<uni-icons 
					size="35"
					customPrefix="iconfont"
					type="icon-lishi"
				></uni-icons>
				<text>浏览历史</text>
			</view>
			<view class="menu-items">
				<uni-icons
					size="35"
					customPrefix="iconfont"
					type="icon-tiezi">
				</uni-icons>
				<text>我的帖子</text>
			</view>
		</view>
		<view class="exchange">
			<view class="menu-items" @click="goto(`/pages/mygoods/mygoods`)">
				<uni-icons 
					size="35" 
					customPrefix="iconfont" 
					type="icon-31quanbushangpin">
				</uni-icons>
				<text>我发布的</text>
			</view>
			<view class="menu-items">
				<uni-icons
					size="35"
					customPrefix="iconfont"
					type="icon-mairu">
				</uni-icons>
				<text>我买入的</text>
			</view>
			<view class="menu-items">
				<uni-icons
					size="35"
					customPrefix="iconfont"
					type="icon-maichu">
				</uni-icons>
				<text>我卖出的</text>
			</view>
		</view>
		<button @click="goto(`/pages/settings/settings`)">设置</button>
		<button v-if="isLogin" @click="logout">退出登录</button>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app"
	
	import cfg from "../../cfg.json";
	
	const isLogin = ref(false);
	const info = ref({});
	
	onLoad(async () => {
		// 获取信息
		getInfo();
		// 获取数量
		if(Object.keys(info.value).length !== 0) {
			
		}
	});
	
	uni.$on("user", () => getInfo());
	
	function getInfo() {
		try {
			info.value = getApp().globalData.login;
			console.log(info.value);
			if(Object.keys(info.value).length !== 0) 
				isLogin.value = true;
		} catch(e){
			//TODO handle the exception
		}
	}
	
	// 跳转页面
	function goto(url){
		uni.navigateTo({
			url: url
		});
	}
	
	
	// 跳转至登录界面
	
	// 跳转至修改个人信息界面
	function gotoEditInfo() {
		uni.navigateTo({
			url: "/pages/edit_info/edit_info"
		});
	}
	
	// 在设置页面通过emit调用之
	function logout() {
		try {
			uni.removeStorage({
				key: "user_login",
				success() {
					getApp().globalData.login = {};
					isLogin.value = false;
				}
			});
		} catch(e){
			//TODO handle the exception
		}
	}
	
	// 
</script>

<style lang="scss">
	.info, .exchange, .views {
		width: 100vw;
	}
	
	.nologin {
		height: 20vh;
	}
	
	.info {
		height: 15vh;
		padding-top: var(--status-bar-height);
		// background-color: blanchedalmond;
		display: flex;
		flex-direction: row;
		
		.avatar {
			width: 10vh;
			height: 10vh;
			border-radius: 50%;
			background-position: center;
			background-size: 100%;
			background-repeat: no-repeat;
			// background-color: aquamarine;
			margin-bottom: 2vh;
		}
		
		.l-side {
			
		}
		
		.r-side {
			margin-left: 3vw;
			width: 70vw;
			// flex: 0 0 1;
			.username {
				font-size: 4vh;
			}
			
			.desc {
				font-size: 2vh;
			}
		}
	}
	
	.menu-items {
		// background-color: $uni-color-primary;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		width: 20vw;
		height: 20vw;
		
		text {
			font-size: 3.5vw;
		}
	}
	
	.views, .exchange {
		// height: 20vh;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly	
	}
</style>
