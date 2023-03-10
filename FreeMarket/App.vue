<script>
	import "@/static/iconfont.css";
	export default {
		onLaunch() {
			const self = this;
			try {
				uni.getStorage({
					key: "user_login",
					success(res) {
						console.log(res);
						getApp().globalData.login = res.data;
						// console.log(this.globalData)
					}
				});
			} catch(e){
				//TODO handle the exception
			}
		},
		onShow() {
			
		},
		onHide() {
			
		},
		globalData:{
			text: "abc",
			login: {}
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.report {
		width: 15vw;
		height: 5vh;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-items: center;
		justify-content: space-evenly;
	}
	
	.searchBox {
		$w2: 52vw;
		$h2: 5vh;
		
		width: $w2;
		height: $h2;
		background-color: white;
		margin-left: 2vw;
		border: $uni-border-color 1px solid;
		border-radius: calc($h2 / 2);
		line-height: $h2;
		display: flex;
		flex-direction: row-reverse;
		
		#searchBtn {
			text-align: center;
			width: 18vw;
			background-color: $uni-color-primary;
			color: white;
			border-radius: calc($h2 / 2);
		}
		
		text {
			margin-right: 21vw;
			color: $uni-border-color;
		}
	}
</style>
