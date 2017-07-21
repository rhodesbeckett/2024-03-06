import { Component } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteStore, RouteState } from '../../manage.store';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import VueRouter from 'vue-router';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export default class RouteDashGamesManageApiSettings extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	privateKey = '';
	shouldShowKey = false;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/developer/games/api/settings/' + route.params.id);
	}

	routed() {
		Meta.title = this.$gettextInterpolate('Game API Settings for %{ game }', {
			game: this.game.title,
		});

		this.privateKey = this.$payload.privateKey;
	}

	async generateNewKey() {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.api.settings.generate_confirmation')
		);

		if (!result) {
			return;
		}

		// Make sure it's a POST request.
		const response = await Api.sendRequest(
			'/web/dash/developer/games/api/settings/generate-new-key/' + this.game.id,
			{}
		);

		if (response.newKey) {
			this.privateKey = response.newKey;
			this.shouldShowKey = true;
			Growls.success({
				title: this.$gettext('dash.games.api.settings.generate_growl_title'),
				message: this.$gettext('dash.games.api.settings.generate_growl'),
				sticky: true,
			});
		}
	}
}
