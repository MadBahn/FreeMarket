<template>
	<view>
		<view v-if="data.length !== 0">
			<view v-for="(i, index) in data" :key="index" class="items">
				<PostUnit :data="i" />
				<button @click="gotoMod(i.post_id)">修改</button>
				<button @click="delPost(i.post_id)">删除</button>
			</view>
			<no-more v-if="!enableBottomRequest" />
		</view>
		<empty v-else />
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad, onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
	
	import PostUnit from "@/components/post_unit/post_unit.vue";
	
	import cfg from "@/cfg.json";
	
	const data = ref([]);
	const end_index = ref(0);
	const enableBottomRequest = ref(true);
	
	onLoad(() => {
		request(true);
	});
	
	onPullDownRefresh(() => {
		request(true);
	});
	
	onReachBottom(() => {
		request(false);
	});
	
	function request(type: boolean) {
		const amount = 10;
		if (type) end_index.value = 0;
		const count = 4;
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.post.prefix}${cfg.api.post.post_display}`,
			method: "POST",
			data: {
				filter: {
					start_at: end_index.value,
					amount: amount,
					sub_filter: {
						post_by: getApp().globalData.login.userid
					}
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					enableBottomRequest.value = res.data.data.length === amount;
					end_index.value = res.data.next_index;
					data.value = type ?
						res.data.data : 
						data.value.concat(res.data.data);
				}
			}
		});
	}
	
	function gotoMod(id: string) {
		uni.navigateTo({
			url: `/pages/new_post/new_post?op=modify&post_id=${id}`
		});
	}
	
	async function delPost(id: string) {
		const r = await uni.showModal({
			title: "警告",
			content: "是否继续？"
		});
		// @ts-ignore
		r.confirm && uni.request({
			url: ``,
			method: "POST",
			data: {
				post_id: id,
				userid: getApp().globalData.login.userid
			},
			success(res) {
				if(res.statusCode === 200) {
					data.value = data.value.filter(i => i.post_id !== id);
				}
			}
		});
	}
	
</script>

<style lang="scss" scoped>
	.items {
		margin-bottom: 1vh;
		border: 1px solid #c2c2c2;
		border-radius: 10px;
		
		button {
			margin: 2vw;
		}
	}
</style>
