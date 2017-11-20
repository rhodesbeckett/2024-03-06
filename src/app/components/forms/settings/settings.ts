import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./settings.html';

import {
	BaseForm,
	FormOnInit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Settings } from '../../settings/settings.service';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { ClientAutoStart } from '../../client/autostart/autostart.service';

type FormModel = {
	chat_notify_friends_online: boolean;
	restricted_browsing: boolean;
	broadcast_modal: boolean;
	animated_thumbnails: boolean;
	game_install_dir: string;
	queue_when_playing: boolean;
	max_download_count: number;
	limit_downloads: boolean;
	max_extract_count: number;
	limit_extractions: boolean;
	autostart_client: boolean;
};

@View
@Component({
	components: {
		AppFormControlToggle,
	},
})
export class FormSettings extends BaseForm<FormModel> implements FormOnInit {
	warnOnDiscard = false;

	ClientAutoStart: typeof ClientAutoStart | null = GJ_IS_CLIENT
		? require('../../client/autostart/autostart.service').ClientAutoStart
		: null;

	onInit() {
		this.setField('restricted_browsing', Settings.get('restricted-browsing'));
		this.setField('broadcast_modal', Settings.get('broadcast-modal'));
		this.setField('animated_thumbnails', Settings.get('animated-thumbnails'));

		if (GJ_IS_CLIENT) {
			this.setField('game_install_dir', Settings.get('game-install-dir'));
			this.setField('queue_when_playing', Settings.get('queue-when-playing'));

			this.setField('max_download_count', Settings.get('max-download-count'));
			this.setField('limit_downloads', this.formModel.max_download_count !== -1);

			this.setField('max_extract_count', Settings.get('max-extract-count'));
			this.setField('limit_extractions', this.formModel.max_extract_count !== -1);

			if (this.ClientAutoStart!.canAutoStart) {
				this.setField('autostart_client', Settings.get('autostart-client'));
			}
		}
	}

	/**
	 * Just opens a file location dialog.
	 */
	changeLocation(ref: string) {
		const elem = this.$refs[ref];
		if (elem) {
			(elem as HTMLElement).click();
		}
	}

	onSelectedInstallDir(dir: string) {
		this.setField('game_install_dir', dir);
		this.onChange();
	}

	@Watch('formModel.limit_downloads')
	limitDownloadsChange(shouldLimit: boolean, prev: boolean) {
		if (shouldLimit === prev) {
			return;
		}

		this.setField(
			'max_download_count',
			shouldLimit ? Settings.getDefault('max-download-count') : -1
		);
	}

	@Watch('formModel.limit_extractions')
	limitExtractionsChange(shouldLimit: boolean, prev: boolean) {
		if (shouldLimit === prev) {
			return;
		}

		this.setField('max_extract_count', shouldLimit ? Settings.getDefault('max-extract-count') : -1);
	}

	onChange() {
		Settings.set('restricted-browsing', this.formModel.restricted_browsing);
		Settings.set('broadcast-modal', this.formModel.broadcast_modal);
		Settings.set('animated-thumbnails', this.formModel.animated_thumbnails);

		if (GJ_IS_CLIENT) {
			Settings.set('game-install-dir', this.formModel.game_install_dir);
			Settings.set('max-download-count', this.formModel.max_download_count);
			Settings.set('max-extract-count', this.formModel.max_extract_count);
			Settings.set('queue-when-playing', this.formModel.queue_when_playing);

			if (this.ClientAutoStart!.canAutoStart) {
				Settings.set('autostart-client', this.formModel.autostart_client);

				if (this.formModel.autostart_client) {
					this.ClientAutoStart!.set();
				} else {
					this.ClientAutoStart!.clear();
				}
			}

			// Tell's it to use the new settings.
			this.$store.commit('clientLibrary/checkQueueSettings');
		}
	}
}
