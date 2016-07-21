import { Injectable, Inject } from 'ng-metadata/core';
import { Notification } from './../../../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedContainer } from './../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from './../../../../components/activity/feed/feed-service';
import { App } from './../../../../app-service';

@Injectable()
export class FeedCtrl
{
	tab: 'activity' | 'notifications' = 'activity';
	notificationsCount: number;
	notifications: ActivityFeedContainer;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Notification' ) notificationModel: typeof Notification,
		@Inject( 'ActivityFeedService' ) feedService: ActivityFeedService,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any
	)
	{
		$scope['Notification'] = notificationModel;
		this.tab = $stateParams['tab'];

		if ( this.tab == 'activity' ) {
			app.title = gettextCatalog.getString( 'Your activity feed' );
		}
		else {
			app.title = gettextCatalog.getString( 'Your notifications' );
		}

		this.notificationsCount = payload.notificationsCount || 0;
		this.notifications = feedService.bootstrap( notificationModel.populate( payload.notifications ) );
	}
}
