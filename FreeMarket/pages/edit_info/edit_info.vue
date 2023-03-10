<template>
	<view class="content">
		edit
		<view>
			头像
		</view>
		<view>
			用户名
		</view>
		<view>
			简介
		</view>
		<view>
			性别
		</view>
		<view>
			生日
		</view>
		<view>
			城市
		</view>
		
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	
	import cfg from "../../cfg.json";
	
	const data = ref({});
</script>

<style lang="scss">

</style>
