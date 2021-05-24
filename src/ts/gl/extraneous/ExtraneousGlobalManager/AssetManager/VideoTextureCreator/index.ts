import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

export class VideoTextureCreator extends ORE.EventDispatcher {

	private videoElm?: HTMLVideoElement;
	private url: string;
	private imgURL?: string;

	constructor( url: string, imgURL?: string ) {

		super();

		this.url = url;
		this.imgURL = imgURL;

		this.createVideoTexture();

	}

	private onVideoLoaded() {

		if ( ! this.videoElm ) return;

		this.videoElm?.play();

		let texture = new THREE.VideoTexture( this.videoElm );

		texture.image.width = texture.image.videoWidth;
		texture.image.height = texture.image.videoHeight;

		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;

		texture.needsUpdate = true;

		this.dispatchEvent( {
			type: 'texturecreated',
			texture: texture
		} );

		let duration = ( this.videoElm.duration - 0.5 );

		texture.onUpdate = () => {

			if ( ! this.videoElm ) return;

			if ( this.videoElm.currentTime >= duration ) {

				this.videoElm.currentTime = 0;
				this.videoElm.play();

			}

		};

		document.addEventListener( 'visibilitychange', () => {

			setTimeout( () => {

				if ( ! this.videoElm ) return;

				this.videoElm.play();

			}, 500 );

		} );

	}

	public createVideoTexture() {

		this.videoElm = document.createElement( 'video' ) as HTMLVideoElement;
		this.videoElm.muted = true;
		this.videoElm.autoplay = true;
		this.videoElm.setAttribute( 'playsinline', '' );

		this.videoElm.oncanplay = this.onVideoLoaded.bind( this );
		this.videoElm.oncanplaythrough = this.onVideoLoaded.bind( this );

		this.videoElm.src = this.url + '?v=' + Math.floor( Math.random() * 10000 ).toString();

		this.videoElm.onstalled = ( e ) => {

			this.createImageTexture();

			if ( this.videoElm ) {

				this.videoElm.onplay = () => {

					if ( ! this.videoElm ) return;

					this.videoElm.currentTime = 4.5;
					this.videoElm.onplay = null;

				};

			}

		};

		this.videoElm.load();

	}

	public createImageTexture() {

		if ( this.imgURL ) {

			let loader = new THREE.TextureLoader();
			loader.crossOrigin = 'use-credentials';

			loader.load( this.imgURL, ( tex ) => {

				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;

				this.dispatchEvent( {
					type: 'texturecreated',
					texture: tex
				} );

			} );

		} else {

			this.dispatchEvent( {
				type: 'texturecreated',
				texture: null
			} );

		}

	}

	public switchPlay( play: boolean ) {

		if ( ! this.videoElm ) return;

		if ( play ) {

			this.videoElm.play();

		} else {

			this.videoElm.pause();

		}

	}

}
