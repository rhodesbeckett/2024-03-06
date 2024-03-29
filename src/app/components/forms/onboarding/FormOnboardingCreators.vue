<script lang="ts" setup>
import { computed, ref } from 'vue';
import AppCreatorCard from '../../../../_common/creator/AppCreatorCard.vue';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import AppForm, { FormController, createForm } from '../../../../_common/form-vue/AppForm.vue';
import Onboarding from '../../../../_common/onboarding/onboarding.service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { arrayShuffle } from '../../../../utils/array';

type FormModel = {
	// nothing
};

const emit = defineEmits({
	next: () => true,
});

const creatorPosts = ref<FiresidePostModel[]>([]);

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		Onboarding.startStep('follows');
	},
	loadUrl: '/web/onboarding/creators',
	onLoad(payload) {
		let newCreatorPosts = payload.creatorPosts
			? arrayShuffle(FiresidePostModel.populate<FiresidePostModel>(payload.creatorPosts))
			: [];

		// Filter out posts so we only display one per user.
		const uniqueCreatorPosts: Record<number, FiresidePostModel> = {};
		for (const post of newCreatorPosts) {
			uniqueCreatorPosts[post.displayUser.id] ??= post;
		}

		creatorPosts.value = Object.values(uniqueCreatorPosts);
	},
	onBeforeSubmit() {
		Onboarding.trackEvent(
			followsAnyCreator.value ? 'follow-creators-set' : 'follow-creators-skip'
		);
	},
	async onSubmit() {
		// Nothing to submit.
	},
	onSubmitSuccess() {
		Onboarding.endStep(shouldShowSkip.value);
		emit('next');
	},
});

const canContinue = computed(() => form.valid);
const shouldShowSkip = computed(() => !followsAnyCreator.value);
const creators = computed(() => creatorPosts.value.map(i => i.user));
const followsAnyCreator = computed(() => creators.value.find(i => !!i.is_following));
</script>

<template>
	<AppForm :controller="form">
		<div class="-form">
			<section class="-message">
				<h1 class="section-header text-display">
					{{ $gettext(`Follow creators`) }}
				</h1>

				<p class="text-muted">
					{{
						$gettext(
							`Let's get you ready to go by following some amazing Game Jolt creators`
						)
					}}
				</p>
			</section>

			<section class="-creators">
				<AppScrollScroller thin>
					<div class="-list">
						<AppCreatorCard
							v-for="post of creatorPosts"
							:key="post.id"
							:post="post"
							follow-button-type="no-count"
							no-link
							follow-on-click
						/>
					</div>
				</AppScrollScroller>
			</section>

			<slot name="controls" :can-continue="canContinue" :should-show-skip="shouldShowSkip" />
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
@import './variables'

.-form
	display: flex
	flex-direction: column
	max-width: 1100px
	margin: 0 auto
	padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: $grid-gutter-width

	text-align: center

	> *:not(:first-child)
		margin-top: 30px

.-creators
	p
		margin-bottom: 5px

	.-list
		display: grid
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
		grid-gap: 8px
		justify-content: space-between

@media $media-mobile
	.-list
		padding-bottom: 40px
</style>
