<template>
	<view class="content">
		<input v-model="newGoods.goods_name" placeholder="商品名"/>
		<view class="price">
			<text>价格</text>
			<view @click="showPrice">
				<text>￥{{newGoods.price}}</text>
				<uni-icons type="right"></uni-icons>
			</view>
		</view>
		<input v-model="newGoods.status" placeholder="商品状况"/>
		<textarea v-model="newGoods.desc" placeholder="商品简介"></textarea>
		<view>
			<button @click="doGoods">{{ operation === "new" ? "添加" : "修改" }}</button>
		</view>
		<uni-file-picker 
			v-model="imgList"
			fileMediatype="image" 
			limit="9" 
			title="商品图片"
			@select="uploadFile"
			@delete="removeFile"
		></uni-file-picker>
	</view>
	
	<uni-popup ref="pricePopup" type="bottom">
		<view class="price-input">
			<view class="display">
				价格：￥{{price_str}}
			</view>
			<view class="keyboard">
				<view class="number">
					<button @click="keyboard(`7`)">7</button>
					<button @click="keyboard(`8`)">8</button>
					<button @click="keyboard(`9`)">9</button>
					<button @click="keyboard(`4`)">4</button>
					<button @click="keyboard(`5`)">5</button>
					<button @click="keyboard(`6`)">6</button>
					<button @click="keyboard(`1`)">1</button>
					<button @click="keyboard(`2`)">2</button>
					<button @click="keyboard(`3`)">3</button>
					<button @click="keyboard(`<`)"><uni-icons type="left"></uni-icons></button>
					<button @click="keyboard(`0`)">0</button>
					<button @click="keyboard(`.`)">.</button>
				</view>
				<view class="action">
					<button @click="keyboard(`clear`)">清除</button>
					<button @click="keyboard(`ok`)">确定</button>
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<script lang="ts" setup>
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
	
	import cfg from "../../cfg.json";
	
	const newGoods = ref({
		goods_id: "",
		owner: getApp().globalData.login.userid,
		goods_name: "",
		price: 0,
		desc: "",
		status: "",
		imgs: [],
		post_date: "",
		isDel: false
	});
	
	const price_str = ref(newGoods.value.price.toString());
	const operation = ref("");
	const imgList = ref([]);
	
	const pricePopup = ref(null);
	
	onLoad((option) => {
		// 编辑（传入商品id并请求数据）或添加
		operation.value = option.operation;
		if(operation.value === "modify") {
			uni.request({
				url: cfg.server + ":" +
					 cfg.port + 
					 cfg.api.prefix + 
					 cfg.api.goods.prefix + 
					 cfg.api.goods.goods_info,
				method: "POST",
				data: {
					goods_id: option.goods_id,
					isEdit: true
				},
				success(res) {
					console.log(res);
					if(res.statusCode === 200){
						newGoods.value = res.data;
						imgList.value = JSON.parse(JSON.stringify(res.data.imgs));
						for(let i in imgList.value) {
							imgList.value[i].url = cfg.server + ":" + cfg.port + "/" +
													imgList.value[i].url;
						}
						console.log(imgList.value);
						console.log(newGoods.value);
					}
				}
			});
		}
	});
	
	/*
	{
		"fieldname": "file",
		"originalname": "181c425a93f7f80c6ed9a9d650f93007.jpeg",
		"encoding": "7bit",
		"mimetype": "image/jpeg",
		"destination": "files",
		"filename": "file-1670467784780.jpeg",
		"path": "files\\file-1670467784780.jpeg",
		"size": 135780
	}
	
	img格式：{
		name: sitrng,
		extname: string,
		url: string
	}
	*/
	
	function showPrice() {
		price_str.value = newGoods.value.price.toString();
		pricePopup.value.open();
	}
	
	function keyboard(input: string) {
		console.log(input);
		// 转化为字符串
		// let str = newGoods.value.price.toString();
		// console.log(str);
		switch(input) {
			// 清除
			case "clear": {
				price_str.value = "0";
				break;
			}
			// 退格
			case "<": {
				price_str.value = 
					price_str.value.slice(0,price_str.value.length - 1);
				console.log(price_str.value.length);
				console.log(0,price_str.value.length - 1)
				console.log(price_str.value);
				
				if(price_str.value.length === 0) price_str.value = "0";
				break;
			}
			case "ok": {
				const tmp = price_str.value.split(".");
				if(tmp.length === 2 && tmp[1].length > 2) {
					tmp[1] = tmp[1].slice(0,2);
					price_str.value = tmp[0].concat(".".concat(tmp[1]));
				}
				newGoods.value.price = price_str.value * 1;
				pricePopup.value.close();
				break;
			}
			// 数字和小数点
			default: {
				if(price_str.value === "0") {
					if(input === ".") price_str.value += input;
					else price_str.value = input;
				}
				else {
					price_str.value = price_str.value.concat(input);
					if(input === "."){
						const regex = /[.]/g;
						const dict = price_str.value.match(regex);
						console.log(dict);
						// 不能有二个（含）以上的小数点
						console.log(dict.length);
						if(dict && dict.length > 1) 
							price_str.value =
								price_str.value.slice(0,price_str.value.length - 1);
					}
				}
				
				console.log(price_str.value);
				break;
			}
		}
		// newGoods.value.price = price_str.value * 1.0;
	}
	
	function checkValue(e) {
		console.log("input");
		console.log(e.detail);
		// 获取extname属性
	}	
	
	function uploadFile(e) {
		// 选择文件后自动上传至服务器并返回一个文件在服务器的地址
		console.log("upload",e);
		console.log(newGoods.value.imgs);
		// 上传
		uni.uploadFile({
			url: cfg.server + ":" +
				 cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.files.prefix + 
				 cfg.api.files.upload_file,
			filePath: e.tempFilePaths[0],
			name: 'file',
			success(res) {
				console.log(res);
				if(res.statusCode === 200){
					const url_t = JSON.parse(res.data)[0]
								.path
								.split("\\")
					const url = "files\\\\".concat(url_t[1]);
					newGoods.value.imgs.push({
						name: JSON.parse(res.data)[0].filename,
						url: url,
						extname: e.tempFiles[0].extname,
					});
					console.log(newGoods.value.imgs);
				}
			}
		});
	}
	
	function removeFile(e) {
		// console.log(e);
		// console.log(e.tempFile.name);
		
		// console.log(imgList.value);
		// console.log(newGoods.value.imgs.filter(i => i.name === e.tempFile.name));
		// 同时将imgs和imgList的项目删除
		newGoods.value.imgs = newGoods.value.imgs.filter(i => i.name !== e.tempFile.name);
		imgList.value = imgList.value.filter(i => i.name !== e.tempFile.name);
		
		console.log("imgList:",imgList.value);
		console.log(newGoods.value.imgs);
	}
	
	function doGoods() {
		console.log(newGoods.value);
		if(newGoods.value.imgs.length === 0) {
			newGoods.value.imgs.push(cfg.empty_image);
		}
		if(operation.value === "new"){
			console.log("new");
			uni.request({
				url: cfg.server + ":" +
					 cfg.port +
					 cfg.api.prefix +
					 cfg.api.goods.prefix +
					 cfg.api.goods.add_goods,
				method: "POST",
				data: {
					new_goods: {
						owner: newGoods.value.owner,
						goods_name: newGoods.value.goods_name,
						desc: newGoods.value.desc,
						price: newGoods.value.price,
						status: newGoods.value.status,
						imgs: newGoods.value.imgs
					}
				},
				success(res) {
					console.log(res);
					if(res.statusCode === 200){
						uni.switchTab({
							url: "/pages/index/index"
						});
						uni.showToast({
							icon: "success",
							title: "商品添加成功"
						});
					}
				}
			});
		} else if(operation.value === "modify") {
			console.log("modify");
			uni.request({
				url: cfg.server + ":" +
					 cfg.port +
					 cfg.api.prefix +
					 cfg.api.goods.prefix +
					 cfg.api.goods.modify_goods,
				method: "POST",
				data: {
					modify_form: newGoods.value,
					userid: getApp().globalData.login.userid
				},
				success(res) {
					console.log(res);
					uni.switchTab({
						url: "/pages/index/index"
					});
					if(res.statusCode === 200){
						uni.showToast({
							icon: "success",
							title: "商品修改成功"
						});
					}
				}
			});
		}
	}
	
</script>

<style lang="scss">
	input, textarea, .price {
		width: 95vw;
		margin-top: 2vh;
	}
	
	textarea {
		height: 12vh;
	}
	
	.price {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	
	.price-input {
		background-color: white;
		width: 100vw;
		height: 40vh;
		display: flex;
		flex-direction: column;
		
		.display {
			padding: 2vh;
		}
		
		.keyboard {
			display: flex;
			flex-direction: row;
			// height: 52vh;
			.number {
				// flex: 0 0 1;
				display: flex;
				flex-wrap: wrap;
				width: 75vw;
				// height: 40vh;
				
				button {
					$buttonHeight: 8vh;
					margin: 0;
					width: 25vw;
					height: $buttonHeight;
					line-height: $buttonHeight;
				}
			}
			
			.action {
				width: 25vw;
				display: flex;
				flex-direction: column;
				
				button {
					width: 100%;
					height: 16vh;
					line-height: 16vh;
				}
			}
		}
	}
</style>
