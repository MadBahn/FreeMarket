<template>
	<view style="margin-top: 3vh;">
		<view v-if="_data.length === 0">还没有评论欸</view>
		<view 
			class="card" 
			v-for="(i,index) in _data" 
			:key="i.comment_id"
			v-else
		>
			<uni-card 
				:title="i.comment_by.username || i.comment_by" 
				:isFull="true" 
				:sub-title="new Date(i.post_date).toLocaleString()" 
				:thumbnail="cfg.server + `:` +
							cfg.port + `/` +
							i.comment_by.headImg"
			>
				<view class="uni-card__content">
					<text>{{i.content}}</text>
				</view>
				<view slot="actions" class="uni-card__actions">
					<commonReport @call="$emit('report', i.comment_id)"/>
				</view>
			</uni-card>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	
	import cfg from "../../cfg.json";
	import commonReport from "@/components/common_report/common_report.vue";
	
	const props = defineProps({
		_data: Array
	});
	
	const default_avatar = ref(cfg.default_avatar);
	
</script>

<style lang="scss" scoped>
	.card {
		width: 100vw;
		min-height: 8vh;
		background-color: $uni-bg-color-grey;
	}
</style>