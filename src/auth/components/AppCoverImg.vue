<script lang="ts" setup>
import { ref, watch } from 'vue';
import { ImgHelper } from '../../_common/img/helper/helper-service';

const props = defineProps({
	imgUrl: {
		type: String,
		required: true,
	},
});

const isLoaded = ref(false);

if (!import.meta.env.SSR) {
	watch(
		() => props.imgUrl,
		async imgUrl => {
			isLoaded.value = false;
			await ImgHelper.loaded(imgUrl);
			isLoaded.value = true;
		},
		{ immediate: true }
	);
}
</script>

<template>
	<div>
		<div class="cover-img-container">
			<div
				class="cover-img anim-fade-in"
				:style="{
					'background-image': `url('${imgUrl}')`,
				}"
				:class="{ loaded: isLoaded }"
			/>
		</div>
		<div class="cover-img-highlight anim-fade-in" :class="{ loaded: isLoaded }" />
	</div>
</template>

<style lang="stylus" scoped>
.cover-img
	&, &-container, &-highlight
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0

	&, &-highlight
		display: none
		background-attachment: fixed

		&.loaded
			display: block

	// The container is what we set the opacity on.
	// We need this since the fade-in animation will set the opacity to 1 which will override the opacity we want for the image.
	&-container
		opacity: 0.3
		z-index: $zindex-cover-img

	&
		background-repeat: no-repeat
		background-position: center center
		background-size: cover

	&-highlight
		background-color: $black
		z-index: $zindex-cover-img-highlight

		@media $media-sm-up
			background-image: linear-gradient(to right, rgba($gj-pink, 0.15) 0, rgba($gj-pink, 0) 25%, rgba($gj-blue, 0) 75%, rgba($gj-blue, 0.15) 100%)
</style>
