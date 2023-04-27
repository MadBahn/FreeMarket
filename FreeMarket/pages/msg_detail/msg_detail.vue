<template>
	<view class="content">
		<view v-if="data.length !== 0">
			<view class="msg_box" v-for="(i, index) in data" :key="i.message_id">
				<!-- {{ i }} -->
				<text class="title">{{ i.title }}</text>
				<text class="context">{{ i.content }}</text>
				<text class="date">{{ new Date(i.post_date).toLocaleString() }}</text>
			</view>
			<no-more v-if="!enableBottomRequest" />
		</view>
		<empty v-else/>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad, onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
	
	import cfg from "@/cfg.json";
	
	const data = ref([]);
	const enableBottomRequest = ref(true);
	const start_at = ref(0);
	const msg_type = ref("");
	
	onLoad((option) => {
		console.log(option);
		
		msg_type.value = option.type;
		request(true);
	});
	
	onPullDownRefresh(() => {
		console.log("pull");
		request(true);
	});
	
	onReachBottom(() => {
		if(enableBottomRequest.value) request(false);
	});
	
	function request(type: boolean){
		const amount = 4;
		if(type) start_at.value = 0;
		
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.user.prefix}${cfg.api.user.msg_detail}`,
			method: "POST",
			data: {
				type: msg_type.value,
				receiver: getApp().globalData.login.userid,
				field: {
					amount: amount,
					start_at: start_at.value
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					enableBottomRequest.value = 
						res.data.data.data.length === amount;
					start_at.value = res.data.data.next_index;
					data.value = type ? res.data.data.data : data.value.concat(res.data.data.data);
				}
			},
			complete() {
				uni.stopPullDownRefresh();
			}
		});
	}
</script>

<style lang="scss" scoped>
	.msg_box {
		margin: 4vh 1vw;
		padding: 3vh;
		width: 80vw;
		min-height: 20vh;
		border: 1px solid #dadada;
		border-radius: 15px;
		display: flex;
		flex-direction: column;
		
		text-align: left;
		.title {
			font-size: 20px;
		}
		
		.context {
			flex-grow: 1;
			margin-top: 1vh;
			margin-bottom: 1vh;
			font-size: 15px;
		}
		
		.date {
			font-size: 15px;
			text-align: right;
		}
	}
</style>
