<template>
	
	<view class="frame">
		<image 
			v-if="data.imgs.length !== 0" 
			:src="`${cfg.server}:${cfg.port}/${data.imgs[0].url}`"
		/>
		
		<view class="info">
			<!-- {{ data }} -->
			<p>
				{{ data.goods_name }}
			</p>
			<p>
				{{ data.desc }}
			</p>
			<p>
				￥{{ data.price }}
			</p>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import cfg from "../../../cfg.json";
	
	const props = defineProps<{
		data: any
	}>();
</script>

<style lang="scss" scoped>
	.frame {
		display: flex;
		flex-direction: row;
		
		image {
			min-width: 10vh;
			min-height: 10vh;
		}
		
		.info{
			width: 60vw;
		}
	}
</style>