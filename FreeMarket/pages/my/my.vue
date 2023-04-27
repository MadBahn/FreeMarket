<template>
	<view class="content">
		<view class="content info">
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
				@click="editAvatar"
			>
			</view>
			<view class="r-side">
				<view v-if="isLogin" @click="gotoInfo(info.userid)">
					<view class="username">{{info.username}}</view>
					<view class="desc">{{info.desc}}</view>
				</view>
				<view v-else>
					<button @click="goto(`/pages/login/login`)">登录</button>
				</view>
			</view>
		</view>
		<view class="views">
			<view class="menu-items" @click="goto(`/pages/favorite/favorite`)">
				<uni-icons 
					color="#0055ff"
					size="35" 
					customPrefix="iconfont" 
					type="icon-favor"
				></uni-icons>
				<text>我的收藏</text>
			</view>
			<view class="menu-items" @click="goto(`/pages/history/history`)">
				<uni-icons 
					color="#0055ff"
					size="35"
					customPrefix="iconfont"
					type="icon-lishi"
				></uni-icons>
				<text>浏览历史</text>
			</view>
			<view class="menu-items" @click="goto(`/pages/mypost/mypost`)">
				<uni-icons
					color="#0055ff"
					size="35"
					customPrefix="iconfont"
					type="icon-tiezi">
				</uni-icons>
				<text>我的帖子</text>
			</view>
		</view>
		<view class="exchange">
			<view class="menu-items" @click="goto(`/pages/mygoods/mygoods`)">
				<uni-icons 
					color="#0055ff"
					size="35" 
					customPrefix="iconfont" 
					type="icon-31quanbushangpin"
				></uni-icons>
				<text>我发布的</text>
			</view>
			<view class="menu-items" @click="goto(`/pages/exchange/exchange?type=buyer`)">
				<uni-icons
					color="#0055ff"
					size="35"
					customPrefix="iconfont"
					type="icon-mairu"
				></uni-icons>
				<text>我买入的</text>
			</view>
			<view class="menu-items" @click="goto(`/pages/exchange/exchange?type=seller`)">
				<uni-icons
					color="#0055ff"
					size="35"
					customPrefix="iconfont"
					type="icon-maichu"
				></uni-icons>
				<text>我卖出的</text>
			</view>
		</view>
		<button 
			style="width: 85vw;text-align: left;" 
			@click="goto(`/pages/settings/settings`)"
		>
			<uni-icons
				color="#0055ff"
				size="20"
				type="gear-filled"
			></uni-icons>
			设置
		</button>
		<uni-popup ref="action">
			<view class="action">
				<view @click="selecctImage(['camera'])">
					<uni-icons type="camera-filled" size="25"></uni-icons>
					<text>拍照</text>
				</view>
				<view @click="selecctImage(['album'])">
					<uni-icons type="image-filled" size="25"></uni-icons>
					<text>选择文件</text>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app"
	
	import cfg from "../../cfg.json";
	
	const isLogin = ref(false);
	const info = ref({});
	
	const action = ref();
	
	onLoad(async () => {
		// 获取信息
		getInfo();
		// 获取数量
		if(Object.keys(info.value).length !== 0) {
			
		}
	});
	
	uni.$on("user", () => getInfo());
	uni.$on("logout", () => logout());
	
	function getInfo() {
		try {
			// getApp().globalData.login = uni.getStorage({
			// 	key: "user_login"
			// });
			info.value = getApp().globalData.login;
			console.log(info.value);
			isLogin.value = (Object.keys(info.value).length !== 0) ;
			
		} catch(e){
			//TODO handle the exception
		}
	}
	
	// 跳转页面
	function goto(url: string){
		uni.navigateTo({
			url: url
		});
	}
	
	function gotoInfo(id: string) {
		uni.navigateTo({
			url: `/pages/info/info?id=${id}`
		});
	}
	// 跳转至修改个人信息界面，信息从localStorage获取，无需在url上添加参数
	
	function editAvatar(){
		action.value.open("bottom");
	}
	
	// 修改用户图像
	function selecctImage(from: Array<string>) {
		uni.chooseImage({
			count: 1,
			sourceType: from,
			success(res) {
				console.log(res);
				// 上传文件
				uni.uploadFile({
					url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.files.prefix}${cfg.api.files.upload_file}`,
					filePath: res.tempFilePaths[0],
					name: 'file',
					success(_res) {
						console.log(_res);
						if(_res.statusCode === 200){
							const url_t = JSON.parse(_res.data)[0]
										.path
										.split("\\")
							const url = "files\\\\".concat(url_t[1]);
							
							// 请求修改用户图像
							uni.request({
								url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.user.prefix}${cfg.api.user.modify_info}`,
								method: "POST",
								data: {
									modify_form: {
										userid: getApp().globalData.login.userid,
										headImg: url
									}
								},
								success(__res) {
									console.log(__res);
									if(__res.statusCode === 200) {
										// globalData
										getApp().globalData.login.headImg = url;
										// localStorage
										uni.setStorage({
											key: "user_login",
											data: __res.data,
											complete() {
												info.value = {};
												getInfo();
												action.value.close();
											}
										});
									}
								}
							})
						}
					}
				});
			}
		});
	}	
	// 在设置页面通过emit调用之
	function logout() {
		try {
			uni.removeStorage({
				key: "user_login",
				success() {
					getApp().globalData.login = {};
					isLogin.value = false;
					getInfo();
				}
			});
		} catch(e){
			//TODO handle the exception
		}
	}
	
	// 
</script>

<style lang="scss" scoped>
	.info, .exchange, .views {
		width: 100vw;
	}
	
	.nologin {
		height: 20vh;
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
	
	.menu-items {
		// background-color: $uni-color-primary;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		width: 20vw;
		height: 20vw;
		
		text {
			font-size: 3.5vw;
		}
	}
	
	.views, .exchange {
		// height: 20vh;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly	
	}
	
	.action {
		background-color: white;
		
		view {
			display: flex;
			flex-direction: row;
			align-items: center;
			padding: 3vw;
			
			text {
				margin-left: 2vw;
				font-size: 2vh;
			}
		}
	}
</style>
