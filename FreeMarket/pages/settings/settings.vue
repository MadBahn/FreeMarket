<template>
	<view>
		<uni-list border="true">
			<uni-list-item 
				title="更改账户信息" 
				clickable="true"
				@click="goto('/pages/edit_info/edit_info')"
			></uni-list-item>
			<uni-list-item title="账户安全" clickable="true"></uni-list-item>
			<uni-list-item title="用户协议" clickable="true"></uni-list-item>
			<uni-list-item title="关于本应用" clickable="true"></uni-list-item>
		</uni-list>
		<button class="logout">退出登录</button>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	
	import cfg from "../../cfg.json";
	
	function goto(url: string) {
		uni.navigateTo({
			url: url,
		});
	}
	
</script>

<style lang="scss">
	.logout {
		$h: 8vh;
		
		margin-top: 4vh;
		width: 90vw;
		height: $h;
		line-height: $h;
		border-radius: calc($h / 2);
		color: white;
		background-color: red;
	}
</style>
