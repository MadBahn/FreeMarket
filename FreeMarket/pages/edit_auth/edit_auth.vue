<template>
	<view>
		<form @submit="submitAuth">
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

</style>
