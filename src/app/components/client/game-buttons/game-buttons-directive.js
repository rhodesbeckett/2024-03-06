angular.module( 'App.Client.GameButtons' ).directive( 'gjClientGameButtons', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/client/game-buttons/game-buttons.html',
		scope: {
			game: '=',
			overlay: '=?overlayVariant',
			small: '=?smallVariant',
			large: '=?largeVariant',
			onShowLaunchOptions: '&?',
			onHideLaunchOptions: '&?',
			onShowOptions: '&?',
			onHideOptions: '&?',
			label: '@?',
			isPatching: '=?',
			hasPackage: '=?',
		},
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $q, $scope, $attrs, Client_Library, Client_Launcher, Client_Installer, LocalDb_Package, Client_InstallPackageModal, Device, Api, Popover, Analytics,
			Game, Game_Package, Game_Release, Game_Build, Game_Build_LaunchOption )
		{
			var _this = this;
			var os = Device.os();
			var arch = Device.arch();

			$scope.Client_Library = Client_Library;
			$scope.LocalDb_Package = LocalDb_Package;

			this.hasInstallableBuilds = this.game.hasDesktopSupport();
			this.canInstall = this.game.canInstall( os, arch );

			this.localPackage = null;
			this.isLoadingPackageData = false;
			this.packageDataPromise = null;

			this.installTooltip = null;
			if ( !this.hasInstallableBuilds ) {
				this.installTooltip = 'This game doesn\'t have any installable builds yet.';
			}
			else if ( !this.canInstall ) {
				this.installTooltip = 'This game is not available for installing on your OS.';
			}

			// We try to pull a package with some action on it.
			// For example, if a package is installing, we want to pull that one to show.
			$scope.$watch( function()
			{
				return Client_Library.findActiveForGame( _this.game.id );
			},
			function( localPackage )
			{
				_this.localPackage = localPackage;
			} );

			if ( !angular.isUndefined( $attrs.isPatching ) ) {
				$scope.$watch( 'ctrl.localPackage.isPatching()', function( isPatching )
				{
					_this.isPatching = isPatching;
				} );
			}

			if ( !angular.isUndefined( $attrs.hasPackage ) ) {
				$scope.$watch( 'ctrl.localPackage', function( localPackage )
				{
					_this.hasPackage = !!localPackage;
				} );
			}

			this.install = function()
			{
				Analytics.trackEvent( 'client-game-buttons', 'install' );

				if ( !this.packageDataPromise ) {
					this.packageDataPromise = Api.sendRequest( '/web/discover/games/packages/' + _this.game.id )
						.then( function( payload )
						{
							var packageData = Game_Package.processPackagePayload( payload );
							packageData.installableBuilds = Game.pluckInstallableBuilds( packageData.packages, os, arch );

							return packageData;
						} );
				}

				this.packageDataPromise
					.then( function( packageData )
					{
						// If more than one package for their OS, then we have to show an install package modal.
						if ( _.size( _.groupBy( packageData.installableBuilds, 'game_package_id' ) ) > 1 ) {
							Client_InstallPackageModal.show( _this.game );
							return;
						}

						var build = Game.chooseBestBuild( packageData.installableBuilds, os, arch );
						Client_Library.installPackage(
							_this.game,
							build._package,
							build._release,
							build,
							build._launch_options
						);
					} );
			};

			this.pause = function()
			{
				Analytics.trackEvent( 'client-game-buttons', 'pause-install' );
				Client_Installer.pause( this.localPackage );
			};

			this.resume = function()
			{
				Analytics.trackEvent( 'client-game-buttons', 'resume-install' );
				Client_Installer.resume( this.localPackage );
			};

			this.cancel = function()
			{
				Analytics.trackEvent( 'client-game-buttons', 'cancel-install' );
				this.localPackage.$uninstall();
			};

			this.retryInstall = function()
			{
				Analytics.trackEvent( 'client-game-buttons', 'retry-install' );
				Client_Installer.retryInstall( this.localPackage );
			};

			this.launch = function( localPackage )
			{
				// If already running, do nothing.
				if ( localPackage.isRunning() ) {
					return;
				}

				Analytics.trackEvent( 'client-game-buttons', 'launch' );
				Popover.hideAll();
				Client_Launcher.launch( localPackage );
			};

			this.openFolder = function( localPackage )
			{
				var fs = require( 'fs' );
				var path = require( 'path' );
				var gui = require( 'nw.gui' );

				fs.readdir( path.resolve( localPackage.install_dir ), function( err, files )
				{
					if ( err ) {
						return;
					}

					// Just open the first file in the folder.
					// This way we open within the package folder instead of the parent folder.
					gui.Shell.showItemInFolder( path.resolve( localPackage.install_dir, files[0] ) );
				} );
			};

			this.uninstallPackage = function( localPackage )
			{
				// If running, do nothing.
				if ( localPackage.isRunning() ) {
					return;
				}

				Analytics.trackEvent( 'client-game-buttons', 'uninstall' );
				Popover.hideAll();
				return localPackage.$uninstall();
			};
		}
	};
} );
