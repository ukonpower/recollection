import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { callbackify } from 'util';

declare interface TextureInfo {
	path: string;
	name: string;
	param?: {
		mapping?: THREE.Mapping,
		wrapS?: THREE.Wrapping,
		wrapT?: THREE.Wrapping,
		magFilter?: THREE.TextureFilter,
		minFilter?: THREE.TextureFilter,
		format?: THREE.PixelFormat,
		type?: THREE.TextureDataType,
		anisotropy?: number,
		encoding?: THREE.TextureEncoding
	}
}

export class AssetManager extends ORE.EventDispatcher {

	private basePath ='./assets';

	public preLoadingManager: THREE.LoadingManager;
	public mustLoadingManager: THREE.LoadingManager;
	public subLoadingManager: THREE.LoadingManager;

	public preAssetsLoaded: boolean = false;
	public mustAssetsLoaded: boolean = false;
	public subAssetsLoaded: boolean = false;

	private gltfPath: string;
	private preLoadTexturesInfo: TextureInfo[];
	private mustLoadTexturesInfo: TextureInfo[];
	private subLoadTexturesInfo: TextureInfo[];

	public gltfScene: THREE.Group;
	public textures: ORE.Uniforms = {};

	public get isLoaded() {

		return this.mustAssetsLoaded;

	}

	constructor() {

		super();

		this.gltfPath = this.basePath + '/scene/scene.glb';

		this.preLoadTexturesInfo = [];

		this.mustLoadTexturesInfo = [
			{ path: this.basePath + '/scene/img/ground-roughness.jpg', name: 'groundRoughness', param: { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping } },
			{ path: this.basePath + '/scene/img/ground-color.jpg', name: 'groundColor', param: { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping } },
			{ path: this.basePath + '/scene/img/ground-normal.jpg', name: 'groundNormal', param: { wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping } },
		];

		this.subLoadTexturesInfo = [];

		this.initLoadingManager();

	}

	private initLoadingManager( ) {

		this.preLoadingManager = new THREE.LoadingManager(
			() => {

				this.preAssetsLoaded = true;

				this.dispatchEvent( new CustomEvent( 'preAssetsLoaded' ) );

			}
		);

		this.mustLoadingManager = new THREE.LoadingManager(
			() => {

				this.mustAssetsLoaded = true;

				this.dispatchEvent( new CustomEvent( 'mustAssetsLoaded' ) );

			},
			( url: string, loadedNum, totalNum ) => {

			}
		);

		this.subLoadingManager = new THREE.LoadingManager(
			() => {

				this.subAssetsLoaded = true;

				this.dispatchEvent( new CustomEvent( 'subAssetsLoaded' ) );

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

		callback && this.addEventListener( 'preAssetsLoaded', callback );

		if ( this.preLoadTexturesInfo.length > 0 ) {

			this.loadTex( this.preLoadTexturesInfo, this.preLoadingManager );

		} else {

			this.dispatchEvent( new CustomEvent( 'preAssetsLoaded' ) );

		}


	}

	private loadMustAssets( callback?: Function ) {

		callback && this.addEventListener( 'mustAssetsLoaded', callback );

		if ( this.mustLoadTexturesInfo.length > 0 || this.gltfPath != '' ) {

			this.loadTex( this.mustLoadTexturesInfo, this.mustLoadingManager );

			new GLTFLoader( this.mustLoadingManager ).load( this.gltfPath, ( gltf ) => {

				this.gltfScene = gltf.scene;

			} );

		} else {

			this.dispatchEvent( new CustomEvent( 'mustAssetsLoaded' ) );

		}

	}

	private loadSubAssets( callback?: Function ) {

		callback && this.addEventListener( 'subAssetsLoaded', callback );

		if ( this.subLoadTexturesInfo.length > 0 ) {

			this.loadTex( this.subLoadTexturesInfo, this.subLoadingManager );

		} else {

			this.dispatchEvent( new CustomEvent( 'subAssetsLoaded' ) );

		}

	}

	private loadTex( infos: TextureInfo[], manager: THREE.LoadingManager ) {

		for ( let i = 0; i < infos.length; i ++ ) {

			let info = infos[ i ];

			this.textures[ info.name ] = { value: null };

			let loader = new THREE.TextureLoader( manager );
			loader.crossOrigin = 'use-credentials';

			loader.load( info.path, ( tex ) => {

				if ( info.param ) {

					let keys = Object.keys( info.param );

					for ( let i = 0; i < keys.length; i ++ ) {

						tex[ keys[ i ] ] = info.param[ keys[ i ] ];

					}

				}

				this.textures[ info.name ].value = tex;

			} );

		}

	}

}
