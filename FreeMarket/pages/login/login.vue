<template>
	<view class="content">
		<view class="item">
			<input 
				v-model="loginForm.username" 
				placeholder="用户名"
			/>
			<input 
				v-model="loginForm.password" 
				placeholder="密码" 
				password="true"
			/>
		</view>
		<view class="action">
			<button @click="login">登录</button>
			<button @click="gotoRegister">注册</button>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import cfg from "../../cfg.json";
	
	const app = getApp();
	
	const loginForm = ref({
		username: "",
		password: ""
	});
	
	// 处理登录请求
	function login(){
		try {
			uni.request({
				url: cfg.server + ":" +
					 cfg.port +
					 cfg.api.prefix +
					 cfg.api.user.prefix +
					 cfg.api.user.login,
				method: "POST",
				data: {
					login_form: loginForm.value
				},
				success(res) {
					console.log(res);
					// @ts-ignore
					if(res.statusCode === 200) {
						uni.setStorage({
							key: "user_login",
							data: res.data
						});
						getApp().globalData.login = res.data;
						uni.$emit("user");
						uni.switchTab({
							url: "/pages/my/my"
						});
						uni.showToast({
							icon:"success",
							title:"登录成功",
						});
					} else {
						uni.showToast({
							icon:"error",
							title:"登录失败",
						});
					}
				}
			})
		} catch(e){
			console.log(e);
		}
	}
	
	function gotoRegister(){
		uni.navigateTo({
			url:"/pages/register/register"
		})
	}
</script>

<style scoped lang="scss">
	$w: 70vw;
	$h: 6vh;
	
	.item {
		input {
			width: $w;
			height: $h;
			line-height: $h;
			margin: 1rem;
			padding-left: 1rem;
			border: 1px solid;
			border-radius: calc($h / 2);
		}
	}
	.action {
		button {
			width: $w;
			height: calc($h * 1.5);
			line-height: calc($h * 1.5);
			border-radius: calc(($h * 1.5) / 2);
			margin-top: 1rem;
			background-color: $uni-color-primary;
			color: white;
		}
	}
</style>
