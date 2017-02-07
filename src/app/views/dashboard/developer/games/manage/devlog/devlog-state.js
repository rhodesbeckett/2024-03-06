angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.devlog', {
		abstract: true,
		url: '/devlog',
		controller: 'Dashboard.Developer.Games.Manage.DevlogCtrl',
		controllerAs: 'devlogCtrl',
		templateUrl: require( './devlog.html' ),
	} );
} );
