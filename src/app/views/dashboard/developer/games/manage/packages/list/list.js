angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.list', {
		url: '',
		controller: 'Dashboard.Developer.Games.Manage.Packages.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/list/list.html',
		resolve: {
			packagesPayload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/developer/games/packages/' + $stateParams.id );
			}
		}
	} );
} );
