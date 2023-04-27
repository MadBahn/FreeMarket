<template>
	<view>
		<form class="f" @submit="submitAuth">
			<!-- 原密码 -->
			<input password name="pwd_cur" placeholder="原密码"/>
			<!-- 新密码 -->
			<input password type="safe-password" name="pwd_new" placeholder="新密码"/>
			<!-- 确认密码 -->
			<input password type="safe-password" name="repwd" placeholder="确认密码"/>
			<button form-type="submit">确认修改</button>
		</form>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import cfg from "@/cfg.json";
	
	const user = ref({});
	
	onLoad(() => {
		// 加载当前用户的信息
		user.value = getApp().globalData.login.userid;
	});
	
	function submitAuth(e) {
		console.log(e.detail.value);
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.user.prefix}${cfg.api.user.modify_auth}`,
			method: "POST",
			data: {
				auth_form: {
					...e.detail.value,
					userid: user.value
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					
				}
			}
		})
	}
	
</script>

<style lang="scss">
	$w: 70vw;
	$h: 6vh;
	
	.f {
		display: flex;
		justify-content: center;
		input {
			width: $w;
			height: $h;
			line-height: $h;
			margin: 1rem;
			padding-left: 1rem;
			border: 1px solid #c2c2c2;
			border-radius: calc($h / 2);
		}
		
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
