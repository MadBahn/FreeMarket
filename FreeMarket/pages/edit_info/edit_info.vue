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
					<radio :checked="info.gender === 'male'" value="male">男</radio>
					<radio :checked="info.gender === 'female'" value="female">女</radio>
					<radio :checked="info.gender === 'others'" value="others">其他</radio>
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
				<picker mode="region"></picker>
			</label>
			<button form-type="submit">确认修改</button>
		</form>
	</view>
</template>

<script lang="ts" setup>
	import { reactive, ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	
	import cfg from "../../cfg.json";
	
	const date = reactive({
		current: new Date()
	});
	const city = reactive({
		province: [],
		cities: []
	});
	const info = ref({});
	
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
					...e.detail.value
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
</style>
