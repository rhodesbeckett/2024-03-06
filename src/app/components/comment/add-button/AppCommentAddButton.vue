<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { CommentableModel } from '../../../../_common/comment/comment-model';
import { Model } from '../../../../_common/model/model.service';
import { $gettext } from '../../../../_common/translate/translate.service';
import { DisplayMode, showCommentModal } from '../modal/modal.service';

const props = defineProps({
	model: {
		type: Object as PropType<Model & CommentableModel>,
		required: true,
	},
	displayMode: {
		type: String as PropType<DisplayMode>,
		required: true,
	},
	placeholder: {
		type: String,
		default: undefined,
	},
});

const { model, placeholder, displayMode } = toRefs(props);

const placeholderText = computed(() => {
	return placeholder?.value ? placeholder.value : $gettext('What do you think?');
});

function open() {
	showCommentModal({
		model: model.value,
		displayMode: displayMode.value,
	});
}
</script>

<template>
	<div v-app-auth-required>
		<div class="comment-add-button" @click="open()">
			{{ placeholderText }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.comment-add-button
	input-placeholder-button()
	change-bg('bg')
	margin-bottom: $line-height-computed
</style>
