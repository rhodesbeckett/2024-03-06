import { NgModule } from 'ng-metadata/core';

import { FormsModule } from './components/forms/forms.module';
import { ViewsModule } from './views/views.module';

import { App } from './app-service';
import { AppComponent } from './app.component';

import { AppModuleNg1 } from './app.module.ng1';

import { ModelModule } from '../lib/gj-lib-client/components/model/model.module';
import { EnvironmentModule } from '../lib/gj-lib-client/components/environment/environment.module';
import AuthModule from '../lib/gj-lib-client/components/auth/auth';
import AuthJoinModule from '../lib/gj-lib-client/components/auth/join/join';
import AuthLoginModule from '../lib/gj-lib-client/components/auth/login/login';
import { PopoverModule } from '../lib/gj-lib-client/components/popover/popover.module';
import { MediaItemModule } from '../lib/gj-lib-client/components/media-item/media-item.module';
import { ApiModule } from '../lib/gj-lib-client/components/api/api.module';
import { PayloadModule } from '../lib/gj-lib-client/components/payload/payload.module';
import { UserModule } from '../lib/gj-lib-client/components/user/user.module';
import { RulerModule } from '../lib/gj-lib-client/components/ruler/ruler.module';
import { AnalyticsModule } from '../lib/gj-lib-client/components/analytics/analytics.module';
import { MetaModule } from '../lib/gj-lib-client/components/meta/meta.module';
import { ScreenModule } from '../lib/gj-lib-client/components/screen/screen.module';
import { ScrollModule } from '../lib/gj-lib-client/components/scroll/scroll.module';
import { ConnectionModule } from '../lib/gj-lib-client/components/connection/connection.module';
import { TranslateLangSelectorModule } from '../lib/gj-lib-client/components/translate/lang-selector/lang-selector.module';
import { TranslateModule } from '../lib/gj-lib-client/components/translate/translate.module';
import { GrowlsModule } from '../lib/gj-lib-client/components/growls/growls.module';
import { HistoryModule } from '../lib/gj-lib-client/components/history/history.module';

@NgModule({
	imports: [
		require( '../lib/ui-router' ).default,

		FormsModule,
		ViewsModule,

		EnvironmentModule,
		ApiModule,
		PayloadModule,
		ModelModule,
		AnalyticsModule,
		PopoverModule,
		MediaItemModule,
		MetaModule,
		RulerModule,
		ScreenModule,
		ConnectionModule,
		AuthModule,
		AuthJoinModule,
		AuthLoginModule,
		UserModule,
		ScrollModule,
		TranslateModule,
		TranslateLangSelectorModule,
		GrowlsModule,
		HistoryModule,
		AppModuleNg1,
	],
	declarations: [
		AppComponent,
	],
	providers: [
		App,
	],
	bootstrap: [
		AppComponent,
	],
})
export class AppModule
{
}
