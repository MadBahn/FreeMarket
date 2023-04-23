<template>
	<view style="margin-top: 3vh;">
		<view v-if="_data.length === 0">还没有评论欸</view>
		<view 
			class="card" 
			v-for="(i,index) in _data" 
			:key="i.comment_id"
			v-else
		>
			<uni-card isFull="true" >
				<template v-slot:title>
					<view @click="gotoInfo(i.comment_by.userid)" class="info">
						<view
							class="avatar l-side" 
							:style="{ 
								backgroundImage: `url(`+ (
									i.comment_by.headImg !== '' ? 
										(
											cfg.server + ':' + 
											cfg.port + '/' +
											i.comment_by.headImg
										) : 
										cfg.default_avatar
								) +`)`
							 }" 
						>
						</view>
						<view class="r-side">
							<view>
								<view class="username">
									{{i.comment_by.username ? i.comment_by.username : i.comment_by}}
								</view>
								<view class="desc">
									{{new Date(i.post_date).toLocaleString()}}
								</view>
							</view>
						</view>
					</view>
				</template>
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
	
	function gotoInfo(id: string) {
		uni.navigateTo({
			url: `/pages/info/info?id=${id}`
		});
	}
	
</script>

<style lang="scss" scoped>
	.card {
		width: 100vw;
		min-height: 8vh;
		background-color: $uni-bg-color-grey;
	}
	
	.info {
		// height: 15vh;
		padding-top: var(--status-bar-height);
		// background-color: blanchedalmond;
		display: flex;
		flex-direction: row;
		align-items: center;
		
		.avatar {
			width: 7vh;
			height: 7vh;
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
				font-size: 3vh;
			}
			
			.desc {
				color: #d0d0d0;
				font-size: 2vh;
			}
		}
	}
</style>