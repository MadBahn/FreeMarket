<template>
	<view class="_form">
		<form @submit="onSubmit">
			<label>
				用户名
				<input :value="info.username" name="username" placeholder="用户名"/>
			</label>
			<label>
				简介
				<input :value="info.desc" name="desc" placeholder="简介"/>
			</label>
			<label>
				性别
				<radio-group name="gender">
					<radio color="#1296db" :checked="info.gender === 'male'" value="male">男</radio>
					<radio color="#1296db" :checked="info.gender === 'female'" value="female">女</radio>
					<radio color="#1296db" :checked="info.gender === 'others'" value="others">其他</radio>
				</radio-group>
			</label>
			<label>
				生日
				<picker 
					name="birthday" 
					mode="date" 
					:value="info.birthday"
					@change="changeBirthday"
				>
					{{ new Date(info.birthday).toLocaleDateString() }}
				</picker>
			</label>
			<label>
				城市
				<!-- <picker mode="region"></picker> -->
				<text @click="() => city_pop.open()">{{ info.city || "没有城市" }}</text>
			</label>
			<button form-type="submit">确认修改</button>
		</form>
		<uni-popup 
			ref="city_pop" 
			type="bottom"
			background-color="#fff"
			class="popup"
		>
			<t-index-address @select="changeCity"></t-index-address>
		</uni-popup>
	</view>
</template>

<script lang="ts" setup>
	import { reactive, ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import cfg from "../../cfg.json";
	
	const date = reactive({
		current: new Date()
	});
	const info = ref({});
	
	const city_pop = ref(null);
	
	onLoad(() => {
		// initialize the data
		info.value = getApp().globalData.login;
		console.log(info.value);
	});
	
	function changeBirthday(e) {
		console.log(e.detail.value);
		info.value.birthday = e.detail.value;
		console.log(info.value);
		console.log(info.value.birthday);
	}
	
	function changeCity(d) {
		// console.log(d);
		info.value.city = `${d.province}-${d.name}`;
		console.log(info.value);
		city_pop.value.close();
	}
	
	// 提交修改请求
	function onSubmit(e) {
		console.log(e.detail.value);
		// /modify_info
		uni.request({
			url: `${cfg.server}:${cfg.port}${cfg.api.prefix}${cfg.api.user.prefix}${cfg.api.user.modify_info}`,
			method: "POST",
			data: {
				modify_form: {
					userid: getApp().globalData.login.userid,
					...e.detail.value,
					city: info.value.city
				}
			},
			success(res) {
				console.log(res);
				if(res.statusCode === 200) {
					// globalData
					getApp().globalData.login = res.data.data;
					// localStorage
					uni.setStorage({
						key: "user_login",
						data: res.data.data,
						complete() {
							uni.$emit("user");
							uni.navigateBack();
							uni.showToast({
								icon: "success",
								title: "修改成功"
							});
						}
					});
				}
			}
		})
	}
	
</script>

<style lang="scss" scoped>
	._form {
		width: 100vw;
	}
	
	.popup {
		height: 30vh;
		background-color: white;
	}
</style>
