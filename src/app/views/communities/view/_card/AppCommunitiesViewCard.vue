<script lang="ts" setup>
import { toRef } from 'vue';
import AppCommunityCardBase from '../../../../../_common/community/card-base/AppCommunityCardBase.vue';
import AppEditableThumbnail from '../_editable-thumbnail/AppEditableThumbnail.vue';
import { useCommunityRouteStore } from '../view.store';

const routeStore = useCommunityRouteStore()!;

const community = toRef(() => routeStore.community);
</script>

<template>
	<AppCommunityCardBase :community="community" overflow>
		<template #thumbnail>
			<AppEditableThumbnail />
		</template>
	</AppCommunityCardBase>
</template>
