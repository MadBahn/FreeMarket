<template>
	<view>
		<form>
			<!-- 原密码 -->
			<input />
			<!-- 新密码 -->
			<input />
			<!-- 确认密码 -->
			<input />
		</form>
	</view>
</template>

<script lang="ts" setup>
	import { ref, reactive } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	const user = ref({});
	
	onLoad(() => {
		// 加载当前用户的信息
		user.value = getApp().globalData.login;
	});
	
	
</script>

<style lang="scss">

</style>
