<script lang="ts" setup>
import {
	computed,
	CSSProperties,
	onMounted,
	onUnmounted,
	ref,
	shallowRef,
	toRef,
	toRefs,
	watch,
	watchEffect,
} from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { ContextCapabilities } from '../../../../_common/content/content-context';
import { formatNumber } from '../../../../_common/filters/number';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { getModel } from '../../../../_common/model/model-store.service';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { SettingChatGroupShowMembers } from '../../../../_common/settings/settings.service';
import { kThemeBacklight, kThemeBacklightFg } from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserVerifiedTick from '../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleFlexCenter } from '../../../../_styles/mixins';
import { useAppStore } from '../../../store';
import { useGridStore } from '../../grid/grid-store';
import AppShellWindow from '../../shell/AppShellWindow.vue';
import { closeChatRoom } from '../client';
import FormChatRoomSettings from '../FormChatRoomSettings.vue';
import { showChatInviteModal } from '../invite-modal/invite-modal.service';
import AppChatMemberList from '../member-list/AppChatMemberList.vue';
import { ChatRoomModel, getChatRoomTitle } from '../room';
import { ChatRoomChannel, createChatRoomChannel } from '../room-channel';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatWindowOutput from './output/AppChatWindowOutput.vue';
import AppChatWindowOutputPlaceholder from './output/AppChatWindowOutputPlaceholder.vue';
import AppChatWindowSend from './send/AppChatWindowSend.vue';

type SidebarTab = 'settings' | 'members';

const props = defineProps({
	roomId: {
		type: Number,
		required: true,
	},
});

const emit = defineEmits({
	'focus-change': (_focused: boolean) => true,
});

const { roomId } = toRefs(props);
const { closeChatPane } = useAppStore();
const { chatUnsafe: chat } = useGridStore();

const headerAvatarSizeStyles: CSSProperties = {
	width: `36px`,
	height: `36px`,
};

const headerAvatarBackgroundColor = kThemeBacklight;
const headerAvatarJolticonColor = kThemeBacklightFg;

const headerAvatarStyles: CSSProperties = {
	...headerAvatarSizeStyles,
	...styleFlexCenter(),
	borderRadius: `50%`,
	backgroundColor: headerAvatarBackgroundColor,
};

// Set up the room with connection logic.
let destroyed = false;
const room = shallowRef(getModel(ChatRoomModel, roomId.value));
const roomChannel = shallowRef<ChatRoomChannel>();

const contentCapabilities = ref(ContextCapabilities.getPlaceholder());
const maxContentLength = ref(1_000);

async function joinChannel() {
	roomChannel.value = createChatRoomChannel(chat.value, {
		roomId: roomId.value,
		instanced: false,
	});

	const payloads = await Promise.all([
		roomChannel.value.joinPromise,
		Api.sendRequest(`/web/chat/rooms/get-message-content-capabilities/${roomId.value}`),
	]);

	// Short circuit if this component is gone by the time the connection was
	// finished.
	if (destroyed) {
		return;
	}

	const inputPayload = payloads[1];
	maxContentLength.value = inputPayload.lengthLimit;
	contentCapabilities.value = ContextCapabilities.fromPayloadList(
		inputPayload.contentCapabilities
	);

	// Set the room after everything else is set up.
	room.value = roomChannel.value.room.value;
}

onMounted(() => {
	joinChannel();
});

onUnmounted(() => {
	destroyed = true;
	roomChannel.value?.leave();
	roomChannel.value = undefined;
});

// When the status of the chat connection changes...
watch(
	() => chat.value.connected,
	() => {
		if (!chat.value.connected) {
			roomChannel.value = undefined;
		} else {
			joinChannel();
		}
	}
);

let showSettingsOnMembersBack = false;

const friendAddJolticonVersion = ref<1 | 2>(1);

/**
 * The sidebar that we want to be displayed.
 */
const preferredSidebar = ref<SidebarTab | undefined>(
	!Screen.isXs && SettingChatGroupShowMembers.get() ? 'members' : undefined
);

/**
 * The sidebar we're actually displaying. Ignores 'members' sidebar when there's
 * nothing worth showing.
 */
const sidebar = toRef(() => {
	if (room.value?.isPmRoom && preferredSidebar.value === 'members') {
		return undefined;
	}
	return preferredSidebar.value;
});

watch(sidebar, (value, oldValue) => {
	if (!value) {
		showSettingsOnMembersBack = false;
		return;
	}

	if (value === 'members') {
		showSettingsOnMembersBack = oldValue === 'settings';
	}
});

const isShowingUsers = toRef(() => preferredSidebar.value === 'members');
const membersCount = toRef(() => formatNumber(room.value?.member_count || 0));
const roomTitle = computed(() => (!room.value ? $gettext(`Chat`) : getChatRoomTitle(room.value)));
const showMembersViewButton = toRef(() =>
	!room.value ? false : !room.value.isPmRoom && !Screen.isXs
);
const friends = toRef(() => chat.value.friendsList.users);

// Sync with the setting.
watchEffect(() => SettingChatGroupShowMembers.set(isShowingUsers.value));

function addGroup() {
	if (!room.value) {
		return;
	}

	// Give the InviteModal the initialUser so it can set them as invited by default
	showChatInviteModal(room.value, friends.value, room.value.user);
}

async function addMembers() {
	if (!room.value) {
		return;
	}

	const result = await showChatInviteModal(room.value, friends.value);
	if (result) {
		showSuccessGrowl(
			$gettext(`Sent invites to users. They will be added to the chat once they accept.`)
		);
	}
}

function toggleSidebar(val: SidebarTab) {
	preferredSidebar.value = sidebar.value === val ? undefined : val;
}

function closeWindow() {
	closeChatRoom(chat.value);

	// xs size needs to show the friends list when closing the room. Any other
	// size can close the whole chat instead.
	if (!Screen.isXs) {
		closeChatPane();
	}
}

function onMobileAppBarBack() {
	if (showSettingsOnMembersBack) {
		preferredSidebar.value = 'settings';
		showSettingsOnMembersBack = false;
	} else {
		preferredSidebar.value = undefined;
	}
}
</script>

<template>
	<AppShellWindow :close-callback="closeWindow" avoid-sidebar="sm-up">
		<div class="_window-main">
			<AppHeaderBar
				class="_header"
				title-size="lg"
				:automatically-imply-leading="false"
				:elevation="2"
			>
				<template #leading>
					<AppButton
						v-if="Screen.isXs"
						v-app-tooltip="$gettext('Close')"
						circle
						trans
						icon="remove"
						:style="{ marginRight: '4px' }"
						@click="closeWindow"
					/>

					<template v-if="room">
						<span v-if="!room.isPmRoom" class="anim-fade-in-enlarge no-animate-xs">
							<div :style="headerAvatarStyles">
								<AppJolticon
									:style="{
										color: headerAvatarJolticonColor,
									}"
									icon="users"
								/>
							</div>
						</span>
						<RouterLink
							v-else-if="room.user"
							class="anim-fade-in-enlarge no-animate-xs"
							:style="{ position: `relative` }"
							:to="room.user.url"
						>
							<AppUserAvatarBubble
								:style="{
									...headerAvatarSizeStyles,
									position: `relative`,
									zIndex: 0,
								}"
								:user="room.user"
								disable-link
								show-frame
								smoosh
							/>
							<AppChatUserOnlineStatus
								:style="{
									position: `absolute`,
									right: 0,
									bottom: 0,
									zIndex: 1,
								}"
								:is-online="room.user.isOnline"
								:size="12"
								:segment-width="1.5"
							/>
						</RouterLink>
					</template>
				</template>

				<template #title>
					<template v-if="room">
						<div
							v-if="!room.isPmRoom"
							class="_header-name anim-fade-in-right no-animate-xs"
						>
							{{ roomTitle }}
						</div>
						<div
							v-else-if="room.user"
							class="_header-name anim-fade-in-right no-animate-xs"
							:title="`${room.user.display_name} (@${room.user.username})`"
						>
							<RouterLink class="link-unstyled" :to="room.user.url">
								{{ roomTitle }}
							</RouterLink>
							<AppUserVerifiedTick :user="room.user" />
							<div class="_header-name-username">@{{ room.user.username }}</div>
						</div>
					</template>
				</template>

				<template #actions>
					<template v-if="room">
						<AppButton
							v-app-tooltip="
								room.isPmRoom
									? $gettext('Create group chat')
									: $gettext('Add friends')
							"
							class="_header-control anim-fade-in"
							circle
							trans
							:icon="`friend-add-${friendAddJolticonVersion}`"
							@mouseenter="friendAddJolticonVersion = 2"
							@mouseleave="friendAddJolticonVersion = 1"
							@click="room!.isPmRoom ? addGroup() : addMembers()"
						/>

						<AppButton
							v-if="showMembersViewButton"
							v-app-tooltip="
								isShowingUsers ? $gettext('Hide members') : $gettext('Show members')
							"
							circle
							trans
							icon="users"
							class="_header-control anim-fade-in"
							:primary="sidebar === 'members'"
							:solid="sidebar === 'members'"
							@click="toggleSidebar('members')"
						/>

						<AppButton
							v-app-tooltip="$gettext(`Settings`)"
							circle
							sparse
							trans
							icon="ellipsis-h"
							:primary="sidebar === 'settings'"
							:solid="sidebar === 'settings'"
							@click="toggleSidebar('settings')"
						/>
					</template>

					<AppButton
						v-if="!Screen.isXs"
						v-app-tooltip="$gettext('Close')"
						class="_header-control"
						circle
						trans
						icon="remove"
						@click="closeWindow"
					/>
				</template>
			</AppHeaderBar>

			<div class="_body">
				<div class="_chatting-section">
					<div class="_output">
						<template v-if="!room || !room.messagesPopulated">
							<AppChatWindowOutputPlaceholder />
						</template>
						<template v-else>
							<AppChatWindowOutput
								class="_output-inner"
								:room="room"
								:background="room.background"
								:overlay="!!room.background"
							/>
						</template>
					</div>

					<div v-if="room" class="_send-container">
						<AppChatWindowSend
							:room="room"
							:capabilities="contentCapabilities"
							:max-content-length="maxContentLength"
							@focus-change="emit('focus-change', $event)"
						/>
					</div>
				</div>

				<div v-if="room && sidebar" class="_sidebar">
					<div v-if="Screen.isDesktop" class="_sidebar-shadow" />

					<div class="_sidebar-container">
						<AppHeaderBar v-if="Screen.isMobile" title-size="lg" center-title>
							<template #leading>
								<AppButton
									icon="chevron-left"
									trans
									sparse
									circle
									@click="onMobileAppBarBack"
								/>
							</template>

							<template #title>
								<template v-if="sidebar === 'settings'">
									<template v-if="room.isGroupRoom">
										<AppTranslate>Group Settings</AppTranslate>
									</template>
									<template v-else>
										<AppTranslate>Chat Settings</AppTranslate>
									</template>
								</template>
								<template v-else>
									<AppTranslate>Group Members</AppTranslate>
								</template>
							</template>

							<template #actions>
								<AppButton
									v-if="!room.isGroupRoom || sidebar === 'members'"
									v-app-tooltip="$gettext('Add friends')"
									class="_header-control"
									circle
									trans
									:icon="`friend-add-${friendAddJolticonVersion}`"
									@mouseenter="friendAddJolticonVersion = 2"
									@mouseleave="friendAddJolticonVersion = 1"
									@click="room!.isPmRoom ? addGroup() : addMembers()"
								/>
							</template>
						</AppHeaderBar>

						<template v-if="sidebar === 'settings'">
							<AppScrollScroller>
								<FormChatRoomSettings
									:room="room"
									:show-members-preview="
										(!showMembersViewButton || Screen.isMobile) &&
										room.isGroupRoom
									"
									:style="{
										paddingTop: Screen.isXs ? '16px' : undefined,
									}"
									@view-members="preferredSidebar = 'members'"
								/>
							</AppScrollScroller>
						</template>
						<template v-else-if="sidebar === 'members'">
							<div v-if="Screen.isDesktop" class="_header-members">
								<AppTranslate>Members</AppTranslate>
								<span> ({{ membersCount }}) </span>
							</div>

							<AppChatMemberList :room="room" />
						</template>
					</div>
				</div>
			</div>
		</div>
	</AppShellWindow>
</template>

<style lang="stylus" scoped>
$-zindex-window-inner = 1
$-zindex-sidebar-shadow = 2
$-zindex-input = 3
$-zindex-header = 4

$-zindex-sidebar-mobile = 10

._window-main
	position: relative
	flex: auto
	display: flex
	flex-direction: column
	min-width: 0
	z-index: $-zindex-window-inner

._header
	z-index: $-zindex-header

._header-name
	text-overflow()

._header-name-username
	font-family: $font-family-base
	font-size: 13px
	line-height: 18px
	font-weight: 400
	color: var(--theme-fg-muted)

._header-control
	position: relative
	vertical-align: top
	margin-left: 4px

._header-members
	font-family: $font-family-heading
	font-size: 19px
	font-weight: 800
	padding: 24px 16px 16px

._body
	display: flex
	flex: auto

._chatting-section
	display: flex
	flex-direction: column
	flex: auto
	min-width: 0
	flex-basis: 480px

._sidebar
	position: relative
	width: 320px
	flex: 0 1 320px

	@media $media-mobile
		position: fixed
		z-index: $-zindex-sidebar-mobile
		left: 0
		top: 0
		right: 0
		bottom: 0
		change-bg(bg)
		width: unset

._sidebar-shadow
	position: absolute
	top: 0
	bottom: 0
	left: 0
	width: 8px
	background: linear-gradient(to right, rgba($black, 0.2), transparent)
	z-index: $-zindex-sidebar-shadow

._output
	change-bg(bg-offset)
	position: relative
	flex: auto
	display: flex
	height: 100%

._sidebar-container
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	flex-direction: column

._output-inner
	// Allows the scroll bar some breathing room
	padding-right: 4px

._send-container
	width: 100%
	flex: none
	z-index: $-zindex-input
</style>
