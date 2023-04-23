<template>
	<view class="content">
		<uni-segmented-control
			class="segs"
			:current="current"
			styleType="text"
			:values="segItems"
			@clickItem="switchSegments"/>
		<view class="favorite-list" v-if="favor_out.length !== 0">
			<!-- {{favor_out}} -->
			<view 
				class="favorite-item" 
				v-for="(i, index) in favor_out"
			>
				<!-- string -->
				<view v-if="!i.isDel">
					<GoodsUnit v-if="type === 'goods'" :data="i.refer_to"/>
					<PostUnit v-else :data="i.refer_to"/>
					<!-- operation -->
					
				</view>
			</view>
		</view>
		<view v-else>NO</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import GoodsUnit from "@/components/goods_unit/goods_unit.vue";
	import PostUnit from "@/components/post_unit/post_unit.vue";
	
	import cfg from "../../cfg.json";
	
	const favor_list = ref([]);
	const favor_out = ref([]);
	const current = ref(0);
	const type = ref("goods");
	const segItems = ref(["商 品", "帖 子"]);
	
	onLoad((option) => {
		request();
	});
	
	
	function switchSegments(e) {
		console.log(e);
		current.value = e.currentIndex;
		// 0为商品，1为帖子
		if(current.value === 0) type.value = "goods";
		else if(current.value === 1) type.value = "post";
		request();
	}
	
	// 请求当前用户的收藏数据
	function request() {
		uni.request({
			url: cfg.server + ":" + 
				 cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.user.prefix + 
				 cfg.api.user.get_favorite,
			method: "POST",
			data: {
				userid: getApp().globalData.login.userid,
				type: type.value
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					favor_list.value = res.data;
					for (let i in favor_list.value) {
						console.log(favor_list.value);
						console.log(favor_list.value[i]);
						console.log(typeof(favor_list.value[i].refer_to));
					}
					
					// favor_out部分添加isDel
					favor_out.value = favor_list.value.map(i => {
						i.isDel = (typeof(i.refer_to) === "string");
						return i;
					});
					
					
					// filterData();
				}
			}
		})
	}
	
</script>

<style scoped lang="scss">
	.segs {
		width: 30vw;
	}
	
	.favorite-list {
		width: 100vw;
		
		.favorite-item {
			margin: 2vh;
			border: 1px solid;
			min-height: 10vh;
			
		}
	}
</style>
