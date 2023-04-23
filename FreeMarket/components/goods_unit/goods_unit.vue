<template>
	<view class="goods_info">
		<view class="img">
			<image class="img" :src="`${cfg.server}:${cfg.port}/${data.imgs[0].url}`"/>
		</view>
		<view class="detail">
			<text>商品名：{{ data.goods_name }}</text>
			<text>价格：
				<text style='font-weight: bold;color: red'>
					￥{{ data.price }}
				</text>
			</text>
			<text>描述：{{ data.desc }}</text>
			<text>商品状态：{{ data.status }}</text>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import cfg from "@/cfg.json";
	
	defineProps<{
		data: any
	}>();
	
	
</script>

<style lang="scss" scoped>
	.goods_info {
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