import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./controls.html';

import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppPopoverTrigger } from '../../../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppTrackEvent } from '../../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppGamePlaylistAddToPopover } from '../../../../../components/game-playlist/add-to-popover/add-to-popover';
import { AppAuthRequired } from '../../../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppGameFollowWidget } from '../../../../../components/game/follow-widget/follow-widget';
import { RouteState, RouteStore } from '../view.state';
import { Store } from '../../../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
		AppGamePlaylistAddToPopover,
		AppGameFollowWidget,
	},
	directives: {
		AppPopoverTrigger,
		AppTrackEvent,
		AppTooltip,
		AppAuthRequired,
	},
})
export class AppDiscoverGamesViewControls extends Vue
{
	@RouteState game: RouteStore['game'];

	@State app: Store['app'];

	Game = Game;
}
