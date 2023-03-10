<template>
	<view class="content">
		<view class="comment-box" @click="open">
			<!-- flex-direction属性为row-reverse -->
			<text>评论</text>
		</view>
	</view>
	
	<uni-popup 
		background-color="#fff" 
		ref="_comment" 
		type="bottom"
	>
		<form>
			
		</form>
		<view class="input-container">
			<textarea 
				v-model="content" 
				placeholder="有没有什么想吐槽的"
			></textarea>
			<button @click="submit">发表</button>
		</view>
	</uni-popup>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	const emit = defineEmits(['submit']);
	
	const content = ref("");
	const _comment = ref(null);
	
	function open() {
		_comment.value.open();
	}
	
	function submit() {
		
		
		_comment.value.close();
		emit('submit', content.value);
	}
</script>

<style lang="scss">
	.comment-box {
		$w2: 95vw;
		$h2: 5vh;
		width: $w2;
		height: $h2;
		line-height: $h2;
		border: $uni-border-color 1px solid;
		border-radius: calc($h2 / 2);
		
		text {
			margin-left: 3vw;
			color: $uni-border-color;
		}
	}
	.input-container {
		width: 100vw;
		height: 30vh;
		display: flex;
		flex-flow: column;
		align-items: center;
		justify-content: center;
		
		textarea {
			width: 90%;
		}
		
		button {
			width: 90%;
		}
	}
</style>