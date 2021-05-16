import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VideoTextureCreator } from './VideoTextureCreator';
import { GLList } from '../../MainVisualWorld/Contents';

declare interface TextureParam {
	mapping?: THREE.Mapping;
	wrapS?: THREE.Wrapping;
	wrapT?: THREE.Wrapping;
	magFilter?: THREE.TextureFilter;
	minFilter?: THREE.TextureFilter;
	format?: THREE.PixelFormat;
	type?: THREE.TextureDataType;
	anisotropy?: number;
	encoding?: THREE.TextureEncoding;
	generateMipmaps?: boolean;
	flipY?: boolean;
}

declare interface TextureInfo {
	path: string;
	name: string;
	param?: TextureParam;
	isVideoTexutre?: boolean;
	videoSubImgPath?: string;
}

export class AssetManager extends ORE.EventDispatcher {

	private basePath = '/assets';

	public preLoadingManager: THREE.LoadingManager;
	public mustLoadingManager: THREE.LoadingManager;
	public subLoadingManager: THREE.LoadingManager;

	public preAssetsLoaded: boolean = false;
	public mustAssetsLoaded: boolean = false;
	public subAssetsLoaded: boolean = false;

	private gltfPath: string = '';
	private preLoadTexturesInfo: TextureInfo[];
	private mustLoadTexturesInfo: TextureInfo[];
	private subLoadTexturesInfo: TextureInfo[];

	public gltfScene: THREE.Group;
	public textures: ORE.Uniforms = {};

	constructor() {

		super();

		this.gltfPath = this.basePath + '/scene/scene.glb';

		this.preLoadTexturesInfo = [
		];

		this.mustLoadTexturesInfo = [
			{ path: this.basePath + '/scene/img/lens.jpg', name: 'lensDirt', param: { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping } },
			{ path: this.basePath + '/scene/img/noise.jpg', name: 'noise', param: { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping } },
			{ path: this.basePath + '/smaa/smaa-area.png', name: 'smaaArea', param: { flipY: false, minFilter: THREE.LinearFilter, generateMipmaps: false, format: THREE.RGBFormat } },
			{ path: this.basePath + '/smaa/smaa-search.png', name: 'smaaSearch', param: { flipY: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false } },
		];

		let glList: GLList = require( '@gl/gl.json' );
		for ( let i = 0; i < glList.length; i ++ ) {

			let name = glList[ i ].fileName;

			this.mustLoadTexturesInfo.push( {
				path: '/assets/scene/img/thumbnails/' + name + '.jpg',
				name: name
			} );

		}

		this.subLoadTexturesInfo = [];

		this.initLoadingManager();

	}

	private initLoadingManager( ) {

		this.preLoadingManager = new THREE.LoadingManager(
			() => {

				this.preAssetsLoaded = true;

				this.dispatchEvent( { type: 'preAssetsLoaded' } );

			}
		);

		this.mustLoadingManager = new THREE.LoadingManager(
			() => {

				this.mustAssetsLoaded = true;

				this.dispatchEvent( { type: 'mustAssetsLoaded' } );

			},
			( url: string, num: number, total: number ) => {

				this.dispatchEvent( { type: 'mustAssetsProcess', num: num, total: total } );

			}
		);

		this.subLoadingManager = new THREE.LoadingManager(
			() => {

				this.subAssetsLoaded = true;

				this.dispatchEvent( { type: 'subAssetsLoaded' } );

			},
		);

	}

	public load() {

		this.registerTextures();

		this.loadPreAssets(
			() => {

				this.loadSubAssets();

				this.loadMustAssets();

			}
		);

	}

	private registerTextures() {

		let textures = this.preLoadTexturesInfo.concat( this.mustLoadTexturesInfo ).concat( this.subLoadTexturesInfo );

		for ( let i = 0; i < textures.length; i ++ ) {

			let info = textures[ i ];

			this.textures[ info.name ] = { value: null };

		}


	}

	private loadPreAssets( callback?: Function ) {

		callback && this.addEventListener( 'preAssetsLoaded', () => {

			callback();

		} );

		if ( this.preLoadTexturesInfo.length > 0 ) {

			this.loadTex( this.preLoadTexturesInfo, this.preLoadingManager );

		} else {

			this.preAssetsLoaded = true;

			this.dispatchEvent( { type: 'preAssetsLoaded' } );

		}


	}

	private loadMustAssets( callback?: Function ) {

		callback && this.addEventListener( 'mustAssetsLoaded', () => {

			callback();

		} );

		if ( this.mustLoadTexturesInfo.length > 0 || this.gltfPath != '' ) {

			this.loadTex( this.mustLoadTexturesInfo, this.mustLoadingManager );

			if ( this.gltfPath != '' ) {

				new GLTFLoader( this.mustLoadingManager ).load( this.gltfPath, ( gltf ) => {

					this.gltfScene = gltf.scene;

				} );

			}

		} else {

			this.mustAssetsLoaded = true;

			this.dispatchEvent( { type: 'mustAssetsLoaded' } );

		}

	}

	private loadSubAssets( callback?: Function ) {

		callback && this.addEventListener( 'subAssetsLoaded', () => {

			callback();

		} );

		if ( this.subLoadTexturesInfo.length > 0 ) {

			this.loadTex( this.subLoadTexturesInfo, this.subLoadingManager );

		} else {

			this.subAssetsLoaded = true;

			this.dispatchEvent( { type: 'subAssetsLoaded' } );

		}

	}

	private loadTex( infos: TextureInfo[], manager: THREE.LoadingManager ) {

		for ( let i = 0; i < infos.length; i ++ ) {

			let info = infos[ i ];

			if ( info.isVideoTexutre ) {

				let creator = new VideoTextureCreator( info.path, info.videoSubImgPath );
				creator.addEventListener( 'texturecreated', ( e ) => {

					this.applyParam( e.detail.texture, info.param );

					this.textures[ info.name ].value = e.detail.texture;

				} );

			} else {

				let loader = new THREE.TextureLoader( manager );
				loader.crossOrigin = 'use-credentials';

				loader.load( info.path, ( tex ) => {

					this.applyParam( tex, info.param );

					this.textures[ info.name ].value = tex;

				} );

			}


		}

	}

	private applyParam( tex: THREE.Texture, param?: TextureParam ) {

		if ( param ) {

			let keys = Object.keys( param );

			for ( let i = 0; i < keys.length; i ++ ) {

				tex[ keys[ i ] ] = param[ keys[ i ] ];

			}

		}

	}

}
