angular.module( 'App.Devlog.Post.Video' ).directive( 'gjDevlogPostVideo', function( Environment )
{
	return {
		restrict: 'AE',
		templateUrl: '/app/components/devlog/post/video/video.html',
		scope: {
			id: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function() {}
	};
} );
