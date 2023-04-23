<template>
	<view @click="goto">
		<!-- 访问日期 -->
		{{ new Date(data.post_date).toLocaleString() }}
		<!-- 数据 -->
		<GoodsUnit v-if="type==='goods'" :data="data.detail"/>
		<PostUnit v-else-if="type==='post'" :data="data.detail"/>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	// 子组件
	import GoodsUnit from "@/components/goods_unit/goods_unit.vue";
	import PostUnit from "@/components/post_unit/post_unit.vue";
	
	const props = defineProps<{
		data: any,
		type: string
	}>();
	
	function goto() {
		console.log("type:", props.type);
		console.log(props.data);
		let url: string; 
		const id: string = props.data.history_to;
		// 根据type决定跳转页面
		if(props.type === "goods") {
			console.log("g");
			url = "browse_goods";
		}
		else if(props.type === "post") {
			console.log("p");
			url = "browse_post";
		}
		console.log(url);
		uni.navigateTo({
			url: `/pages/${url}/${url}?id=${id}&userid=${getApp().globalData.login.userid}`
		});
	}
</script>

<style>

</style>