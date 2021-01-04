import barba, { IView } from '@barba/core';
import * as ORE from '@ore-three-ts';
import { MainVisualScene } from './MainVisualScene';
import { MainVisualManager } from './MainVisualScene/MainVisualManager';
import { GLList } from './MainVisualScene/MainVisualWorld/Contents';

declare global {
	interface Window {
		mainVisualManager: MainVisualManager;
		isSP: boolean;
	}
}

class APP {

	private scene: MainVisualScene;
	private controller: ORE.Controller;

	constructor() {

		this.initBarba();
		this.initORE();

	}

	private initBarba() {

		let glList = require( '@gl/gl.json' ) as GLList;

		let views: IView[] = [];


		for ( let i = - 1; i < glList.length; i ++ ) {

			let glName = i < 0 ? 'main' : glList[ i ].title;

			views.push( {
				namespace: glName,
				beforeLeave: () => {

					return this.scene.switchInfoVisibility( false );

				},
				beforeEnter: ( data ) => {

					let open = data.next.namespace != 'main';

					if ( open ) {

						return this.scene.openContent( data.next.namespace );

					} else {

						return this.scene.closeContent();

					}

				},
				afterEnter: ( data ) => {

					return this.scene.switchInfoVisibility( true );

				},
			} );

		}

		barba.init( {
			transitions: [
				{
					leave: () => {
					},
					enter: ( data ) => {
					},
					afterEnter: () => {
					}
				}
			],
			views: views
		} );

	}

	private initORE() {

		let canvas = document.querySelector( "#canvas" ) as HTMLCanvasElement;
		this.controller = new ORE.Controller();

		this.scene = new MainVisualScene();
		this.controller.addLayer( this.scene, {
			name: 'SceneController',
			canvas: canvas
		} );

	}

}

window.addEventListener( 'DOMContentLoaded', ()=>{

	let app = new APP();

} );
