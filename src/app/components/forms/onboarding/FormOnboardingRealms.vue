<script lang="ts" setup>
import { computed, ref } from 'vue';
import AppForm, { FormController, createForm } from '../../../../_common/form-vue/AppForm.vue';
import Onboarding from '../../../../_common/onboarding/onboarding.service';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { RealmModel } from '../../../../_common/realm/realm-model';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';

type FormModel = {
	// nothing
};

const emit = defineEmits({
	next: () => true,
});

const realms = ref<RealmModel[]>([]);

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		Onboarding.startStep('follows');
	},
	loadUrl: '/web/onboarding/realms',
	onLoad(payload) {
		realms.value = RealmModel.populate(payload.realms);
	},
	onBeforeSubmit() {
		Onboarding.trackEvent(joinedAnyRealm.value ? 'follow-realms-set' : 'follow-realms-skip');
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
const shouldShowSkip = computed(() => !joinedAnyRealm.value);
const joinedAnyRealm = computed(() => realms.value.find(i => !!i.is_following));
</script>

<template>
	<AppForm :controller="form">
		<div class="-form">
			<section class="-message">
				<h1 class="section-header text-display">
					{{ $gettext(`What are you into?`) }}
				</h1>

				<p class="text-muted">
					{{ $gettext(`Follow your interests to discover awesome creators`) }}
				</p>
			</section>

			<section class="-realms">
				<AppScrollScroller thin>
					<div class="-list">
						<AppRealmFullCard
							v-for="realm of realms"
							:key="realm.id"
							:realm="realm"
							no-sheet
							overlay-content
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
	--grid-item-width: 200px
	display: flex
	flex-direction: column
	max-width: 1100px
	margin: 0 auto
	padding: ($grid-gutter-width-xs / 2)
	text-align: center

	@media $media-xs
		--grid-item-width: 128px

	@media $media-sm-up
		padding: $grid-gutter-width

	> *:not(:first-child)
		margin-top: 30px

.-realms
	p
		margin-bottom: 5px

.-list
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(var(--grid-item-width), 1fr))
	grid-gap: 8px
	justify-content: space-between

	@media $media-mobile
		padding-bottom: 40px
</style>
