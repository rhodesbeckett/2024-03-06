var config = {
	staticCdn: 'https://b6d3e9q9.ssl.hwcdn.net',
	extraBower: {
		'angular-bootstrap': [
			'src/transition/transition.js',
			'src/position/position.js',
			'src/bindHtml/bindHtml.js',
			'src/tooltip/tooltip.js',
			'src/collapse/collapse.js',
			'src/modal/modal.js'
		],
	},
	modules: {
		'vendor-app.js': {
			bower: [
				'moment',
				'humanize-duration',
				'angular-moment',
				'angular-hotkeys',
				'ocLazyLoad',
				'angular-ui-utils',
				'favico.js',
				'angular-inview',
				'angular-elastic',
				'ua-parser-js',
			]
		},
		'vendor-checkout.js': {
			bower: [
				'angular-credit-cards',
				'angular-ui-mask',
			],
		},
		'jquery.js': {
			bower: [
				'jquery',
			]
		},
		'hammer.js': {
			bower: [
				'hammerjs',
				'angular-hammer',
			],
		},
		'jcrop.js': {
			bower: [
				'jcrop',
			],
		},
		'graphs.js': {
			bower: [
				'Chart.js',
				'tc-angular-chartjs',
			],
		},
		'upload.js': {
			bower: [
				'ng-file-upload',
			],
		},
		'ui-tree.js': {
			bower: [
				'angular-ui-tree',
			],
		},
		'primus.js': {
			componentVendor: [
				'primus',
			],
		},
		'error-tracking.js': {
			componentVendor: [
				'error-tracking',
			],
		},

		// Sections of the site.
		'dash.js': {
			components: [
				'forms/dashboard',
				'site-analytics',
			],
			views: [
				'dashboard',
			]
		},
		'forums.js': {
			components: [
				'forms/forum',
				'forum',
			],
			views: [
				'forums',
			]
		},
		'channels.js': {
			main: '/views/discover/channels/channels.ts',
			views: [
				'discover/channels',
			]
		},

		// For client.
		'client.js': {
			bower: [
				'dexie',
			],
			components: [
				'client',
			],
		},

		'client-updater.js': {
			components: [
				'client-updater',
			],
		},

		// For client sections.
		'client-base.js': {
			components: [
				'client-base',
			]
		}
	},
	sections: [
		'auth',
		'checkout',
	],
	translations: 'site-translations',
	translationSections: [
		'auth',
		'dash',
		'checkout',
	],
};

require( './src/lib/gj-lib-client/gulp/tasks/common.js' )( config );
require( './tasks/client.js' )( config );
require( './tasks/app.js' )( config );
