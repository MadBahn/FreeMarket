<template>
	<view class="content">
		<label>
			商品名称：<input v-model="newGoods.goods_name" placeholder="商品名"/>
		</label>
		<view class="price">
			<text>价格</text>
			<view @click="showPrice">
				<text style="font-weight: bold;color: red;">￥{{newGoods.price}}</text>
				<uni-icons type="right"></uni-icons>
			</view>
		</view>
		<label>
			商品状况：
			<input v-model="newGoods.status" placeholder="商品状况"/>
		</label>
		<label>
			商品简介：
			<textarea v-model="newGoods.desc" placeholder="商品简介"></textarea>
		</label>
		<view>
			<button @click="doGoods">
				{{ operation === "new" ? "添加" : "修改" }}
			</button>
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
		<PriceKeypad :price="newGoods.price" @changePrice="changePrice" />
	</uni-popup>
</template>

<script lang="ts" setup>
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
	
	import PriceKeypad from "@/components/price_keypad/price_keypad.vue";
	
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
						newGoods.value = res.data.data;
						imgList.value = JSON.parse(JSON.stringify(res.data.data.imgs));
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
		pricePopup.value.open();
	}
	
	function changePrice(p: string) {
		newGoods.value.price = 1.0 * p;
		pricePopup.value.close();
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
		// 同时将imgs和imgList的项目删除
		newGoods.value.imgs = newGoods.value.imgs.filter(i => i.name !== e.tempFile.name);
		imgList.value = imgList.value.filter(i => i.name !== e.tempFile.name);
		
		console.log("imgList:",imgList.value);
		console.log(newGoods.value.imgs);
	}
	
	// 添加或修改商品
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

<style lang="scss" scoped>
	$w: 70vw;
	$h: 6vh;
	
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
	
	label {
		margin-top: 2vh;
		color: #adadad;
		
		textarea, input {
			color: black;
		}
		
	}
	
	button {
		width: $w;
		height: calc($h * 1.5);
		line-height: calc($h * 1.5);
		border-radius: calc(($h * 1.5) / 2);
		margin-top: 1rem;
		background-color: $uni-color-primary;
		color: white;
	}
</style>
