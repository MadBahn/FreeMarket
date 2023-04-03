<template>
	<view>
		举报理由：
		<form @submit="onSubmit">
			<radio-group name="reason" change="">
				<label>
					<radio color="#1296db" value="law violation"/>
					违反法律法规
				</label>
				<label>
					<radio color="#1296db" value=""/>
					敏感内容
				</label>
				<label>
					<radio color="#1296db" value="inappropriate content"/>
					内容不适
				</label>
				<label>
					<radio color="#1296db" value="fake content"/>
					虚假信息
				</label>
				<label>
					<radio color="#1296db" value="other"/>
					其他
					<textarea name="other_reason" maxlength="-1"></textarea>
				</label>
			</radio-group>
			<button form-type="submit">提交</button>
		</form>
	</view>
</template>

<script lang="ts" setup>
	import { onLoad, onShow } from "@dcloudio/uni-app";
	import { ref } from "vue";
	
	import cfg from "../../cfg.json";
	
	const to = ref("");
	
	onLoad((option) => {
		console.log("onLoad");
		console.log("option:",option);
		to.value = option.refer_to;
		console.log(to.value)
	});
	
	function onSubmit(e) {
		console.log(e.detail.value);
		
		// 执行与服务器相同的检查
		if(true) {
			
		} else {
			
		}
		
		
		uni.request({
			url: cfg.server + ":" +
				 cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.user.prefix + 
				 cfg.api.user.create_report,
			method: "POST",
			data: {
				report_form: {
					...e.detail.value,
					report_by: getApp().globalData.login.userid,
					refer_to: to.value
				}
			},
			success(res) {
				console.log(res);
				uni.navigateBack();
			}
		});
	}
</script>

<style lang="scss" scoped>

</style>
