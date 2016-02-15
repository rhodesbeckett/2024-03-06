angular.module( 'App.Forum.PostList' ).directive( 'gjForumPostList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forum/post-list/post-list.html',
		scope: {
			topic: '=',
			posts: '=',
			userPostCounts: '=',
			isReplies: '=?',
			onReply: '&?',
		},
		bindToController: true,
		controllerAs: 'listCtrl',
		controller: function()
		{
			this.showingReplies = {};
			this.replies = {};
			this.replyCounts = {};
		},
	}
} );
