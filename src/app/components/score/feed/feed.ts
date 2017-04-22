import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./feed.html?style=./feed.styl';

import { GameScoreTable } from '../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { ActivityStreamSubscription } from '../../../../lib/gj-lib-client/components/activity/stream/subscription.service';
import { ActivityStream } from '../../../../lib/gj-lib-client/components/activity/stream/stream.service';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';

@View
@Component({
	components: {
		AppUserAvatar,
		AppTimeAgo,
	},
})
export class AppScoreFeed extends Vue
{
	@Prop( GameScoreTable ) scoreTable: GameScoreTable;

	latestScore: any | null = null;
	scores: any[] = [];

	private subscription?: ActivityStreamSubscription;

	@Watch( 'scoreTable.id', { immediate: true } )
	onScoreTableChange()
	{
		// Only works in browser context.
		if ( Environment.isPrerender || GJ_IS_SSR ) {
			return;
		}

		this.closeSubscription();
		this.setupSubscription();
	}

	destroyed()
	{
		this.closeSubscription();
	}

	private processUser( user: any )
	{
		const noAvatar = 'https://s.gjcdn.net/img/no-avatar-3.png';
		user.img_avatar = 'https://secure.gravatar.com/avatar/' + user.email_hash + '?s=200&r=pg&d=' + encodeURIComponent( noAvatar );
	}

	private async setupSubscription()
	{
		this.subscription = await ActivityStream.subscribe(
			'scores',
			{ tableId: this.scoreTable.id },
			( message: any ) => this.messageHandler( message ),
		);
	}

	private messageHandler( message: any )
	{
		if ( !message.event ) {
			return;
		}

		switch ( message.event ) {
			case 'new-scores':

				if ( !message.scores || !message.scores.length ) {
					return;
				}

				let latestScoreDate: Date | null = null;
				if ( this.latestScore ) {
					latestScoreDate = new Date( this.latestScore.time );
				}

				for ( const score of message.scores ) {

					const scoreDate = new Date( score.time );

					if ( !latestScoreDate || scoreDate.getTime() > latestScoreDate.getTime() ) {
						this.latestScore = score;

						if ( score.user ) {
							this.processUser( score.user );
						}

						this.scores.unshift( score );
					}
				}

				this.scores = this.scores.slice( 0, 3 );

				break;
		}
	}

	private closeSubscription()
	{
		if ( this.subscription ) {
			this.subscription.unsubscribe();
		}

		this.latestScore = null;
		this.subscription = undefined;
	}
}
