<template>
	<view class="report" @click="$emit(`call`)">
		<uni-icons customPrefix="iconfont" type="icon-report" />
		<text>举报</text>
	</view>
</template>

<script>
	export default {
		name:"common_report",
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="scss">

</style>