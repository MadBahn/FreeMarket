<template>
	<!-- 账号消息 -->
	<view class="content" v-if="info !== undefined">
		<view class="info">
			<view
				class="avatar l-side" 
				:style="{ 
					backgroundImage: `url(`+ (
						info.headImg !== '' ? 
							(
								cfg.server + ':' + 
								cfg.port + '/' +
								info.headImg
							) : 
							cfg.default_avatar
					) +`)`
				 }" 
			>
			</view>
			<view class="r-side">
				<view>
					<view class="username">{{info.username}}</view>
					<view class="desc">
					<uni-icons
						v-if="info.gender === 'male'"
						color="blue"
						customPrefix="iconfont"
						type="icon-xingbienan"
					></uni-icons>
					<uni-icons
						v-else-if="info.gender === 'female'"
						color="pink"
						customPrefix="iconfont"
						type="icon-xingbienv"
					></uni-icons>
					<uni-icons
						v-else
						customPrefix="iconfont"
						type="icon-xingbie"
					></uni-icons>
					{{info.desc}}</view>
				</view>
			</view>
		</view>
		<view>
			<text>城市：{{ info.city }}</text>
		</view>
		<view class="data">
			<!-- 用户所发布的数据 -->
			<uni-segmented-control 
				class="segs"
				:values="segs" 
				:current="current"
				@clickItem="switchSegs"
				styleType="text" 
			/>
			<view>
				<view v-for="(i,index) in data" @click="goto(data_type==='goods' ? i.goods_id : i.post_id)">
					<GoodsUnit 
						v-if="data_type==='goods'" 
						:data="i"
					/>
					<PostUnit 
						v-else-if="data_type==='post'" 
						:data="i"
					/>
				</view>
			</view>
			<view>no data</view>
		</view>
	</view>
	<view v-else>
		好像不存在欸
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad, onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
	
	import GoodsUnit from "@/components/goods_unit/goods_unit.vue";
	import PostUnit from "@/components/post_unit/post_unit.vue";
	
	import cfg from "@/cfg.json";
	
	const userid = getApp().globalData.login.userid;
	
	const id = ref("");
	const info = ref({});
	const data = ref([]);
	
	const data_type = ref("goods");
	
	const segs = ref(["商 品","帖 子"]);
	const current = ref(0);
	const start_index = ref(0);
	const enableBottomRequest = ref(true);
	
	onLoad((option) => {
		id.value = option.id;
		request();
		requestData(true);
	});
	
	onPullDownRefresh(() => {
		requestData(true);
	});
	
	onReachBottom(() => {
		requestData(false);
	});
	
	function switchSegs(e) {
		current.value = e.currentIndex;
		
		if(current.value === 0) data_type.value = "goods";
		else if(current.value === 1) data_type.value = "post";
		
		requestData(true);
	}
	
	function request() {
		// 请求个人信息
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.user.prefix}${cfg.api.user.user_info}`,
			method: "POST",
			data: {
				userid: id.value
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) info.value = res.data.data;
				console.log(info.value);
			}
		})
	}
	
	function requestData(type: boolean) {
		const amount = 4;
		
		if(type) start_index.value = 0;
		
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.user.prefix}${cfg.api.user.get_published}`,
			method: "POST",
			data: {
				userid: id.value,
				type: data_type.value,
				field: {
					start_at: start_index.value,
					amount: amount
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					enableBottomRequest.value = 
						res.data.data.length === amount;
					start_index.value = res.data.data.next_index;
					data.value = type ? res.data.data.data : data.value.concat(res.data.data.data);
				}
			}
		})
	}
	
	function goto(id: string) {
		
		let url: string;
		// 根据type决定跳转页面
		if(data_type.value === "goods") {
			url = "browse_goods";
		}
		else if(data_type.value === "post") {
			url = "browse_post";
		}
		console.log(url);
		
		uni.navigateTo({
			url: `/pages/${url}/${url}?id=${id}&userid=${getApp().globalData.login.userid}`
		});
	}
</script>

<style lang="scss" scoped>
	.segs {
		width: 30vw;
	}
	.info {
		height: 15vh;
		padding-top: var(--status-bar-height);
		// background-color: blanchedalmond;
		display: flex;
		flex-direction: row;
		
		.avatar {
			width: 10vh;
			height: 10vh;
			border-radius: 50%;
			background-position: center;
			background-size: 100%;
			background-repeat: no-repeat;
		}
		
		.l-side {
			
		}
		
		.r-side {
			margin-left: 3vw;
			width: 70vw;
			// flex: 0 0 1;
			.username {
				font-size: 4vh;
			}
			
			.desc {
				font-size: 2vh;
			}
		}
	}
	.data {
		width: 100vw;
	}
</style>
