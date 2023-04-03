<template>
	<view @click="goto">
		<!-- 访问日期 -->
		{{ data.post_date }}
		<!-- 数据 -->
		<history-goods v-if="type==='goods'" :data="data.detail"/>
		<history-post v-else-if="type==='post'" :data="data.detail"/>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	// 子组件
	import historyGoods from "./sub/history-goods.vue";
	import historyPost from "./sub/history-post.vue";
	
	const props = defineProps<{
		data: any,
		type: string
	}>();
	
	function goto() {
		console.log("type:", props.type);
		// 根据type决定跳转页面
		if(props.type === "goods") console.log("g");
		else if(props.type === "post") console.log("p");
	}
</script>

<style>

</style>