<template>
	<view
		style="width: 100vw;
		 height: 20rem;
		 background-color: white;"
	>
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
					<radio color="#1296db" value="inappropriate"/>
					内容不适
				</label>
				<label>
					<radio color="#1296db" value=""/>
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
	import ref from "vue";
	import { onLoad, onShow } from "@dcloudio/uni-app";
	
	import cfg from "../../cfg.json";
	
	onLoad(() => {
		console.log("onLoad");
	});
	
	onShow(() => {
		console.log("onShow");
	});
	
	function onSubmit(e) {
		console.log(e.detail.value);
		uni.request({
			url: cfg.server + ":" +
				 cfg.port + 
				 cfg.api.prefix + 
				 cfg.api.user.prefix + 
				 cfg.api.user.create_report,
			method: "POST",
			data: {
				report_form: {
					...e.detail.value
				}
			},
			success(res) {
				console.log(res);
			}
		});
	}
</script>

<style lang="scss" scoped>

</style>