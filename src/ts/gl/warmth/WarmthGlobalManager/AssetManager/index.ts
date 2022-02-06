import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VideoTextureCreator } from './VideoTextureCreator';

declare interface TextureParam {
	premultiplyAlpha?: boolean
	mapping?: THREE.Mapping
	wrapS?: THREE.Wrapping
	wrapT?: THREE.Wrapping
	magFilter?: THREE.TextureFilter
	minFilter?: THREE.TextureFilter
	format?: THREE.PixelFormat
	type?: THREE.TextureDataType
	anisotropy?: number
	encoding?: THREE.TextureEncoding
}


declare interface TextureInfo {
	path: string;
	name: string;
	param?: TextureParam;
	isVideoTexutre?: boolean;
	videoSubImgPath?: string;
}

export class AssetManager extends ORE.EventDispatcher {

	private basePath = '/warmth/assets/scene/';

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

	public gltfScene: THREE.Group | null = null;
	public textures: ORE.Uniforms = {};

	public get isLoaded() {

		return this.mustAssetsLoaded;

	}

	constructor() {

		super();

		this.gltfPath = this.basePath + 'warmth.glb';

		this.preLoadTexturesInfo = [];

		this.mustLoadTexturesInfo = [];

		this.subLoadTexturesInfo = [];

		/*------------------------
			InitLoadingManager
		------------------------*/

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

			}
		);

		this.subLoadingManager = new THREE.LoadingManager(
			() => {

				this.subAssetsLoaded = true;

				this.dispatchEvent( { type: 'subAssetsLoaded' } );

			}
		);

	}
	public load() {

		this.loadPreAssets(
			() => {

				this.loadSubAssets();

				this.loadMustAssets();

			}
		);

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

			this.textures[ info.name ] = { value: null };

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

			tex.premultiplyAlpha = param.premultiplyAlpha || false;
			tex.mapping = param.mapping || THREE.Texture.DEFAULT_MAPPING;
			tex.wrapS = param.wrapS || THREE.ClampToEdgeWrapping;
			tex.wrapT = param.wrapT || THREE.ClampToEdgeWrapping;
			tex.magFilter = param.magFilter || THREE.LinearFilter;
			tex.minFilter = param.minFilter || THREE.LinearFilter;
			tex.format = param.format || THREE.RGBAFormat;
			tex.type = param.type || THREE.UnsignedByteType;
			tex.anisotropy = param.anisotropy || 1;
			tex.encoding = param.encoding || THREE.LinearEncoding;

		}

	}

}
