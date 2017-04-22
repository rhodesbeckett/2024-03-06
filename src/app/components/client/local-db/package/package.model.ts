import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../../../../lib/gj-lib-client/components/game/release/release.model';
import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { GameBuildLaunchOption } from '../../../../../lib/gj-lib-client/components/game/build/launch-option/launch-option.model';
import { IDownloadProgress, IExtractProgress, IParsedWrapper } from 'client-voodoo';
import { db } from '../local-db.service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { LocalDbGame } from '../game/game.model';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { ClientLibrary } from '../../library/library.service';
import { ClientInstaller } from '../../installer/installer.service';

export class LocalDbPackage
{
	// Will be used for install_state and update_state.
	static readonly PATCH_PENDING = 'patch-pending';
	static readonly DOWNLOADING = 'downloading';
	static readonly DOWNLOAD_FAILED = 'download-failed';
	static readonly DOWNLOADED = 'downloaded';
	static readonly UNPACKING = 'unpacking';
	static readonly UNPACK_FAILED = 'unpack-failed';
	static readonly UNPACKED = 'unpacked';

	static readonly REMOVING = 'removing';
	static readonly REMOVE_FAILED = 'remove-failed';

	private _uninstallingPromise?: Promise<void>;

	install_dir: string | null;
	install_state: string | null;
	update_state: string | null;
	remove_state: string | null;
	update: LocalDbPackage | null;
	download_progress: IDownloadProgress | null;
	unpack_progress: IExtractProgress | null;
	patch_paused: boolean | null;
	patch_queued: boolean | null;
	running_pid: IParsedWrapper | null;

	id: number;
	game_id: number;
	title: string;
	description: string;

	release: {
		id: number;
		version_number: string;
	};

	build: {
		id: number;
		folder: string;
		type: string;
		archive_type: string;
		os_windows: boolean;
		os_windows_64: boolean;
		os_mac: boolean;
		os_mac_64: boolean;
		os_linux: boolean;
		os_linux_64: boolean;
		os_other: boolean;
		modified_on: number;
	};

	file: {
		id: number;
		filename: string;
		filesize: string;
	};

	launch_options: {
		id: number;
		os: string;
		executable_path: string;
	}[];

	constructor()
	{
		Object.defineProperties(this, {
			_uninstallingPromise: { enumerable: false, writable: true },
		} );
	}

	static fromPackageInfo = function( _package: GamePackage, release: GameRelease, build: GameBuild, launchOptions: GameBuildLaunchOption[] )
	{
		const localPackage = new LocalDbPackage();

		localPackage.id = _package.id;
		localPackage.game_id = _package.game_id;
		localPackage.title = _package.title;
		localPackage.description = _package.description;

		localPackage.release = {
			id: release.id,
			version_number: release.version_number,
		};

		localPackage.build = {
			id: build.id,
			folder: build.folder,
			type: build.type,
			archive_type: build.archive_type,
			os_windows: build.os_windows,
			os_windows_64: build.os_windows_64,
			os_mac: build.os_mac,
			os_mac_64: build.os_mac_64,
			os_linux: build.os_linux,
			os_linux_64: build.os_linux_64,
			os_other: build.os_other,
			modified_on: build.modified_on,
		};

		localPackage.file = {
			id: build.primary_file.id,
			filename: build.primary_file.filename,
			filesize: build.primary_file.filesize,
		};

		// All launch options are passed in.
		// Let's just pull the ones for our build.
		const _launchOptions: typeof LocalDbPackage.prototype.launch_options = [];
		for ( let launchOption of launchOptions ) {
			if ( launchOption.game_build_id !== build.id ) {
				continue;
			}

			_launchOptions.push( {
				id: launchOption.id,
				os: launchOption.os,
				executable_path: launchOption.executable_path,
			} );
		}
		localPackage.launch_options = _launchOptions;

		return localPackage;
	}

	static createForInstall( _package: GamePackage, release: GameRelease, build: GameBuild, launchOptions: GameBuildLaunchOption[] )
	{
		const localPackage = this.fromPackageInfo( _package, release, build, launchOptions );
		localPackage.install_state = this.PATCH_PENDING;
		return localPackage;
	}

	getDownloadUrl()
	{
		if ( this.install_state ) {
			return GameBuild.getDownloadUrl( this.build.id, {
				forceDownload: true,
			} );
		}
		else if ( this.update_state ) {
			if ( !this.update ) {
				throw new Error( 'Update build is not set' );
			}

			return GameBuild.getDownloadUrl( this.update.build.id, {
				forceDownload: true,
			} );
		}
		throw new Error( 'Not ready to get the package download url' );
	}

	get isSettled()
	{
		return !this.install_state && !this.update_state && !this.remove_state;
	}

	get isPatching()
	{
		return this.install_state === LocalDbPackage.PATCH_PENDING
			|| this.install_state === LocalDbPackage.DOWNLOADING
			|| this.install_state === LocalDbPackage.UNPACKING
			|| this.update_state === LocalDbPackage.PATCH_PENDING
			|| this.update_state === LocalDbPackage.DOWNLOADING
			|| this.update_state === LocalDbPackage.UNPACKING
			;
	}

	get isInstalling()
	{
		return this.install_state === LocalDbPackage.PATCH_PENDING
			|| this.install_state === LocalDbPackage.DOWNLOADING
			|| this.install_state === LocalDbPackage.UNPACKING
			;
	}

	get isUpdating()
	{
		return this.update_state === LocalDbPackage.PATCH_PENDING
			|| this.update_state === LocalDbPackage.DOWNLOADING
			|| this.update_state === LocalDbPackage.UNPACKING
			;
	}

	get isDownloading()
	{
		return this.install_state === LocalDbPackage.DOWNLOADING
			|| this.update_state === LocalDbPackage.DOWNLOADING
			;
	}

	get isUnpacking()
	{
		return this.install_state === LocalDbPackage.UNPACKING
			|| this.update_state === LocalDbPackage.UNPACKING
			;
	}

	get isPatchPaused()
	{
		return !!this.patch_paused;
	}

	get isPatchQueued()
	{
		return !!this.patch_queued;
	}

	get didInstallFail()
	{
		return this.install_state === LocalDbPackage.DOWNLOAD_FAILED
			|| this.install_state === LocalDbPackage.UNPACK_FAILED
			;
	}

	get didUpdateFail()
	{
		return this.update_state === LocalDbPackage.DOWNLOAD_FAILED
			|| this.update_state === LocalDbPackage.UNPACK_FAILED
			;
	}

	get isRunning()
	{
		return !!this.running_pid;
	}

	get isRemoving()
	{
		return this.remove_state === LocalDbPackage.REMOVING;
	}

	setInstalled()
	{
		// Remove any stuff only needed while installing.
		this.install_state = null;
		this.download_progress = null;
		this.unpack_progress = null;
		this.patch_paused = null;
		this.patch_queued = null;
	}

	setUpdated()
	{
		// Copy the new package into this one.
		// this.assign( this.update );
		// TODO: validate Object.assign is good enough a replacement for model.assign
		Object.assign( this, this.update );

		// Remove any stuff only needed while updating.
		this.update = null;
		this.update_state = null;
		this.download_progress = null;
		this.unpack_progress = null;
		this.patch_paused = null;
		this.patch_queued = null;
	}

	async startUpdate( newBuildId: number )
	{
		// If this package isn't installed (and at rest), we don't update.
		// We also don't update if we're currently running the game. Imagine that happening!
		if ( !this.isSettled || this.isRunning ) {
			return false;
		}

		const response = await Api.sendRequest( '/web/client/get-build-for-update/' + newBuildId, null, { detach: true } );
		if ( !response.package ) {
			return false;
		}

		this.update = LocalDbPackage.fromPackageInfo( response.package, response.release, response.build, response.launchOptions );
		this.update_state = LocalDbPackage.PATCH_PENDING;

		await db.packages.put( this );

		const game = ClientLibrary.games[ this.game_id ];
		ClientInstaller.install( game, this );

		return true;
	}

	async uninstall()
	{
		let game: LocalDbGame | undefined;

		// We just use this so they don't click "uninstall" twice in a row.
		// No need to save to the DB.
		if ( this._uninstallingPromise ) {
			return this._uninstallingPromise;
		}

		this._uninstallingPromise = db.transaction( 'rw', [ db.games, db.packages ], async () =>
		{
			// Are we removing a current install?
			const wasInstalling = this.isInstalling;

			try {
				// Cancel any installs first.
				// It may or may not be patching.
				await ClientInstaller.cancel( this )
				game = await db.games.get( this.game_id );

				// Make sure we're clean.
				this.install_state = null;
				this.download_progress = null;
				this.unpack_progress = null;
				this.patch_paused = null;
				this.patch_queued = null;

				this.remove_state = LocalDbPackage.REMOVING;
				await db.packages.put( this );
				await ClientLibrary.removePackage( this );

				// Get the number of packages in this game.
				const count = await db.packages.where( 'game_id' ).equals( this.game_id ).count();

				// Note that some times a game is removed before the package (really weird cases).
				// We still want the remove to go through, so be sure to skip this situation.
				// If this is the last package for the game, remove the game since we no longer need it.
				if ( game && count <= 1 ) {
					await db.games.delete( game.id );
				}

				await db.packages.delete( this.id );

				if ( !wasInstalling ) {
					Growls.success( 'Removed ' + (this.title || (game ? game.title : 'the package')) + ' from your computer.', 'Package Removed' );
				}
			}
			catch ( err ) {
				console.error( err );

				if ( wasInstalling ) {
					Growls.error( 'Could not stop the installation.' );
				}
				else {
					Growls.error( 'Could not remove ' + (this.title || (game ? game.title : 'the package')) + '.', 'Remove Failed' );
				}

				this.remove_state = LocalDbPackage.REMOVE_FAILED;
				await db.packages.put( this );
			}
		} );

		return this._uninstallingPromise;
	}
}
