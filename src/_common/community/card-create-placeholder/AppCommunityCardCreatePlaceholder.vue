<script lang="ts" setup>
import { $gettext } from '../../translate/translate.service';
import AppCommunityAddWidget from '../add-widget/AppCommunityAddWidget.vue';
</script>

<template>
	<div class="community-card-create-placeholder sheet">
		<div class="-text">{{ $gettext(`Create a Community`) }}</div>
		<div class="-widget">
			<div class="-widget-button">
				<AppCommunityAddWidget />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.community-card-create-placeholder
	width: 100%
	max-width: 250px

	.-text
		text-align: center
		font-family: $font-family-heading
		font-size: $font-size-large
		font-weight: bold
		color: var(--theme-fg-muted)

	.-widget
		display: flex
		align-items: center
		justify-content: center
		margin: 40px 0 20px 0

	.-widget-button
		position: relative
		width: 100px
		height: 100px
</style>
