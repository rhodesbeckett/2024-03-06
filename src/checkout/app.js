angular.module( 'App', [
	// Libs.
	'ngSanitize',
	'ngAnimate',
	'ui.router',
	'chieffancypants.loadingBar',
	'ui.bootstrap.collapse',
	'ui.bootstrap.modal',
	'ui.bootstrap.position',
	'credit-cards',
	'ui.mask',

	// GJ lib.
	'gj.Environment',
	'gj.Api',
	'gj.Payload',
	'gj.Model',
	'gj.Error',
	'gj.Translate',
	'gj.Geo',

	'gj.Debug',
	'gj.Debug.DebugBar',
	'gj.Ruler',
	'gj.Screen',
	'gj.BodyClasses',
	'gj.Analytics',
	'gj.Loading',
	'gj.Loading.LoadingPageTransition',
	'gj.Scroll',
	'gj.Scroll.AutoScroll',
	'gj.ExpandWhen',
	'gj.Form',
	'gj.Registry',
	'gj.History',

	'gj.Img.Helper',
	'gj.Img.ImgResponsive',

	'gj.SiteSelector',

	'gj.Game',
	'gj.MediaItem',

	'gj.User',
	'gj.User.UserBar',
	'gj.User.UserAvatar',

	'gj.Sellable',
	'gj.Sellable.Pricing',

	'gj.Popover',

	'App.Forms',

	// Views.
	'App.Views',
] )
.config( function( $locationProvider, $uiViewScrollProvider, $compileProvider, $httpProvider, EnvironmentProvider, $sceDelegateProvider )
{
	$sceDelegateProvider.resourceUrlWhitelist( [
		'self',
		'https://b6d3e9q9.ssl.hwcdn.net/**',
	] );

	$locationProvider.html5Mode( true ).hashPrefix( '!' );
	$uiViewScrollProvider.useAnchorScroll();

	$compileProvider.debugInfoEnabled( false );
	$httpProvider.useApplyAsync( true );

	// We are on WTTF!
	EnvironmentProvider.isWttf = true;
} );
