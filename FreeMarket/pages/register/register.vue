<template>
	<view class="content">
		register
		<view class="item">
			<input 
				v-model="registerForm.username" 
				placeholder="用户名"
			/>
			<input 
				v-model="registerForm.email" 
				placeholder="邮箱" 
				@blur="verifyEmail"
			/>
			<input 
				v-model="registerForm.password" 
				placeholder="密码" 
				password="true"
			/>
			<input 
				v-model="registerForm.password_confirm" 
				placeholder="确认密码" 
				password="true"
			/>
		</view>
		<view class="action">
			<button @click="register">确认注册</button>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import cfg from "../../cfg.json";
	
	const app = getApp();
	
	const registerForm = ref({
		username: "",
		email: "",
		password: "",
		password_confirm: ""
	});
	
	// 检测用户名是否重复
	
	function verifyEmail() {
		uni.request({
			url: cfg.server + ":" + 
				 cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.user.prefix + 
				 cfg.api.user.verify_email + 
				 registerForm.value.email,
			success(res) {
				console.log(res);
			}
		});
	}
	
	// 处理注册请求
	function register(){
		try {
			uni.request({
				url: cfg.server + ":" + 
					 cfg.port + 
					 cfg.api.prefix + 
					 cfg.api.user.prefix + 
					 cfg.api.user.register,
				method: "POST",
				data: {
					register_form: registerForm.value
				},
				success(res) {
					console.log("res",res);
					if(res.statusCode === 200) {
						uni.navigateTo({
							url: "/pages/login/login"
						});
						uni.showToast({
							title: "注册成功",
							icon:"success"
						});
					} else {
						uni.showToast({
							title: "注册失败",
							icon:"error"
						});
					}
				},
				fail(err) {
					console.log("err",err);
					uni.showToast({
						title: "服务器出了问题",
						icon:"error"
					});
				}
			});
		} catch(e) {
			console.log(e);
		}
		
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
			border: 1px solid #c2c2c2;
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
