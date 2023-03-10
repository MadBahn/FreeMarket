<template>
	<!-- loading -->
	<contentLoading v-if="isLoading"/>
	<!-- error -->
	<contentError v-if="isError"/>
	<scroll-view 
		class="content" 
		style="height: auto;" 
		v-if="!isError"
	>
		<view class="main_content">
			<uni-card 
				isFull="true"
				:title="content.owner.username || content.owner"
				:subTitle="new Date(content.post_date).toLocaleString()"
				:thumbnail="content.owner.headImg || cfg.default_avatar"
			>
				<text>￥{{content.price}} | {{content.status}}</text>
				<view>{{content.desc}}</view>
				<view id="imgs">
					<image 
						v-for="(i, index) 
						in content.imgs" 
						:key="index" 
						:src="cfg.server + `:` + 
							  cfg.port + `/` + 
							  i.url"
					></image>
				</view>
				<view slot="actions" class="uni-card__actions">
					<commonReport @call="call_goods" />
				</view>
			</uni-card>
		</view>
		<uni-section 
			id="comment" 
			titleFontSize="20px" 
			title="评论" 
			type="line" 
			class="content comments"
		>
			<commentInput @submit="getSubmit"/>
			<comment-display 
				:_data="content.comments" 
				@report="call_report"
			/>
		</uni-section>
		<view class="bottom-tab" v-if="!content.error">
			<uni-icons 
				color="#1296db"
				size="40" 
				type="chat" 
				@click="comment"
			></uni-icons>
			<uni-icons 
				color="#1296db"
				size="40" 
				:type="content.isFavorite ? 'star-filled' : 'star'" 
				@click="favorite"
			></uni-icons>
			<button @click="want">我想要</button>
		</view>
		
		<uni-popup type="bottom" ref="report">
			<report-popup/>
		</uni-popup>
	</scroll-view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad, onError } from "@dcloudio/uni-app";
	import commentInput from "../../components/comment_input/comment_input.vue";
	import commentDisplay from "../../components/comment_display/comment_display.vue";
	import contentLoading from "../../components/content_loading/content_loading.vue";
	import contentError from "../../components/content_error/content_error.vue";
	import commonReport from "../../components/common_report/common_report.vue";
	import reportPopup from "../../components/report_popup/report_popup.vue";
	
	import cfg from "../../cfg.json";
	
	// 展示的商品内容
	const content = ref({});
	// 举报
	const report_data = ref({
		to: "",
		reason: ""
	});
	// 加载商品数据的查询条件
	const query = ref({});
	// 加载页面控制
	const isLoading = ref(true);
	// 错误页面控制
	const isError = ref(false);
	
	// 绑定时要与需要绑定的popup的ref值相等
	const report = ref(null);
	
	onLoad((option) => {
		uni.showNavigationBarLoading();
		query.value.id = option.id;
		query.value.userid = option.userid;
		request(query.value);
	});
	
	onError((err) => {
		console.log(err);
	});
	
	// 加载商品请求
	function request(data){
		uni.request({
			url: "http://localhost:4000/api/goods/goods_info",
			method: "POST",
			data: {
				goods_id: data.id,
				userid: data.userid,
			},
			success(res) {
				console.log(res);
				content.value = res.data
				// error
				if(content.value.error) isError.value = true;
				console.log(content.value);
			},
			fail(){
				isError.value = true;
				uni.setNavigationBarTitle({
					title: "出错了"
				});
			},
			complete() {
				isLoading.value = false;
				uni.hideNavigationBarLoading();
			}
		});
	}
	
	// 发表评论请求
	function getSubmit(c) {
		console.log(c);
		uni.request({
			url: cfg.server + ":" + 
				 cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.user.prefix + 
				 cfg.api.user.create_comment,
			method: "POST",
			data: {
				comment_form: {
					content: c,
					comment_to: content.value.goods_id,
					comment_by: getApp().globalData.login.userid
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					const t = res.data;
					t.comment_by = getApp().globalData.login;
					content.value.comments.push(t);
				}
			}
		});
	}

	// 滚动至（假）评论输入框
	function comment() {
		uni.createSelectorQuery()
			.select('#comment')
			.boundingClientRect(data => {
		  // console.log("得到布局位置信息" + JSON.stringify(data));
		  uni.createSelectorQuery()
			  .select('.main_content')
			  .boundingClientRect(res => {
			  // console.log("得到布局位置信息" + JSON.stringify(res));
			  uni.pageScrollTo({
			  	duration: 100,
				scrollTop: data.top - res.top
			  });
		  }).exec();
		}).exec();
	}
	
	// 收藏请求
	function favorite() {
		uni.request({
			url: cfg.server + ":" +
				 cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.user.prefix + 
				 cfg.api.user.favorite,
			method: "POST",
			data: {
				favorite_form: {
					userid: getApp().globalData.login.userid,
					refer_to: content.value.goods_id
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					uni.showToast({
						icon: "success",
						title: res.data.msg
					})
					content.value.isFavorite = 
						!content.value.isFavorite;
				}
			}
		})
	}
	
	// 订单请求
	function want() {
		// 生成订单
		
	}
	
	// 举报商品
	function call_goods(){
		console.log("reach call");
		call_report(content.value.goods_id);
	}
	
	// 弹出举报窗口
	function call_report(id){
		console.log(id);
		// report_data.value.to = id;
		// report.value.open();
		
		// 跳转举报页面
		uni.navigateTo({
			url: "/pages/report/report?refer_to=" + id + 
				 "&report_by=" + getApp().globalData.login.userid
		});
	}
</script>

<style lang="scss" scoped>
	.main_content {
		width: 100vw;
		display: flex;
		flex-flow: column;
		
		#content {
			display: flex;
			// flex-flow: column;
			// align-items: center;
			justify-content: center;
			width: 98%;
		}
		
		#imgs {
			display: flex;
			flex-direction: column;
			// flex-wrap: wrap;
			justify-content: center;
			
			image {
				width: 100%;
				background-color: $uni-bg-color-mask;
				// flex: 1 1 0%
			}
		}
		
	}
	.bottom-tab {
		$h: 8vh;
		
		display: flex;
		flex-flow: row;
		position: fixed;
		z-index: 20;
		background-color: white;
		width: 100vw;
		bottom: 0;
		height: $h;
		justify-content: space-evenly;
		align-items: center;
		
		button {
			width: 70%;
			height: calc($h * 0.8);
			margin: 0;
			line-height: calc($h * 0.8);
			background-color: $uni-color-primary;
			color: white;
			border-radius: calc($h / 2);
		}
	}
	.comments {
		justify-content: flex-start;
		min-height: 30vh;
		padding-bottom: 8vh;
		
		
	}
</style>
