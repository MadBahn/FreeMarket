<template>
	<view class="post_info">
		<view class="img">
			<image class="img" :src="`${cfg.server}:${cfg.port}/${data.imgs[0].url}`"/>
		</view>
		<view class="detail">
			<text>标题：{{ data.title }}</text>
			<text>发帖者：{{ data.post_by.username }}</text>
			<text style="overflow: hidden;">内容：{{ data.content }}</text>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import cfg from "@/cfg.json";
	
	const props = defineProps<{
		data: any
	}>();
</script>

<style lang="scss" scoped>
	.post_info {
		margin: 1vh;
		padding: 1vh;
		border: 1px #dadada solid;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		
		.img {
			$l: 15vh;
			width: $l;
			height: $l;
		}
		.detail {
			margin-left: 2vw;
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			
			font-size: 14px;
			text {
				margin-top: 0.5vh;
			}
		}
	}
</style>