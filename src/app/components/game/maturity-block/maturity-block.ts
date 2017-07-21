import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./maturity-block.html?style=./maturity-block.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Settings } from '../../settings/settings.service';
import { isPrerender } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { State } from 'vuex-class';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { AppGameOgrs } from '../ogrs/ogrs';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppGameOgrs,
	},
})
export class AppGameMaturityBlock extends Vue {
	@Prop(Game) game: Game;

	@State app: Store['app'];

	private hasBypassed = false;

	get shouldBlock() {
		return (
			this.game &&
			this.game.tigrs_age === 3 &&
			!isPrerender &&
			!GJ_IS_SSR &&
			Settings.get('restricted-browsing') &&
			!(this.app.user && this.app.user.id === this.game.developer.id) &&
			!this.hasBypassed
		);
	}

	@Watch('game', { immediate: true })
	onWatch() {
		this.hasBypassed = false;
	}

	proceed() {
		this.hasBypassed = true;
		Scroll.to(0, { animate: false });
		Analytics.trackEvent('restricted-browsing', 'unblock');
	}

	removeRestriction() {
		Settings.set('restricted-browsing', false);
		this.proceed();
	}
}
