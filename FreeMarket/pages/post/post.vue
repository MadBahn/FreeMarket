<template>
	<view>
		<uni-nav-bar
			height="5vh" 
			leftIcon="back" 
			statusBar 
			fixed 
			title="post" 
			@clickLeft="goBack"
			/>
	</view>
</template>

<script lang="ts" setup>
	import cfg from "../../cfg.json";
	
	const app = getApp();
	
	function goBack() {
		uni.navigateBack()
	}
</script>

<style scoped lang="scss">

</style>
