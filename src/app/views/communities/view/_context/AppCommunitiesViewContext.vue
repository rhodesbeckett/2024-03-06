<script lang="ts" setup>
import { PropType, computed, provide } from 'vue';
import { useRoute } from 'vue-router';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import { CommunityChannelCardWidth } from '../../../../components/community/channel/card/AppCommunityChannelCard.vue';
import { useAppStore } from '../../../../store';
import AppCommunitiesViewCard from '../_card/AppCommunitiesViewCard.vue';
import AppNavChannels from '../_nav/channels/AppNavChannels.vue';
import AppNavEdit from '../_nav/edit/AppNavEdit.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';

const props = defineProps({
	routeStore: {
		type: Object as PropType<CommunityRouteStore>,
		required: true,
	},
});

provide(CommunityRouteStoreKey, props.routeStore);

const { toggleLeftPane } = useAppStore();
const route = useRoute();

const isEditing = computed(() => isEditingCommunity(route));

function onChangeSection(path: string) {
	// If changing channels, hide the left pane/context sidebar.
	if (route.path !== path) {
		toggleLeftPane();
	}
}
</script>

<template>
	<div v-if="routeStore.isLoaded" class="sidebar-context-channels">
		<div
			:style="{
				maxWidth: `${CommunityChannelCardWidth}px`,
			}"
		>
			<AppCommunitiesViewCard />
		</div>

		<AppNavChannels v-if="!isEditing" />
		<AppNavEdit v-else @change-section="onChangeSection" />
	</div>
</template>

<style lang="stylus" scoped>
.sidebar-context-channels
	padding: var(--shell-content-sidebar-padding)

	@media $media-sm-up
		padding-right: 0
</style>
