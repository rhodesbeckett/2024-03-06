import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service.ts';

@Injectable()
export class LibraryCtrl
{
	collections: any[];
	followedCollection: any;
	developerCollection: any;
	ownedCollection: any;

	constructor(
		@Inject( '$scope' ) $scope: any,
		@Inject( 'App' ) app: App,
		@Inject( 'GameCollection' ) gameCollection: any,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = 'Library of ' + $scope.profileCtrl.user.display_name;

		this.collections = gameCollection.populate( payload.collections );

		this.followedCollection = payload.followedCollection ? new gameCollection( payload.followedCollection ) : null;
		this.developerCollection = payload.developerCollection ? new gameCollection( payload.developerCollection ) : null;
		this.ownedCollection = payload.ownedCollection ? new gameCollection( payload.ownedCollection ) : null;

		this.collections.unshift( this.ownedCollection );
		this.collections.unshift( this.followedCollection );

		if ( this.developerCollection ) {
			this.collections.unshift( this.developerCollection );
		}
	}
}
