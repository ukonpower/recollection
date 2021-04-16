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

		/*------------------------
			Open Main
		------------------------*/

		views.push( {
			namespace: 'main',
			beforeLeave: () => {

				return this.scene.switchInfoVisibility( false );

			},
			beforeEnter: async ( data ) => {

				let skipAnimation = data.current.namespace == '' || data.current.namespace == 'about';

				await this.scene.closeContent( skipAnimation );
				this.scene.switchInfoVisibility( true );

			}
		},
		{
			namespace: 'about',
			beforeLeave: () => {

				this.scene.closeAbout();
				return this.scene.switchInfoVisibility( false );

			},
			beforeEnter: async ( data ) => {

				if ( data.current.namespace != '' && ! /(main|about)/.test( data.current.namespace ) ) {

					await this.scene.closeContent();


				}

				this.scene.openAbout();

			}
		} );

		/*------------------------
			Open GLs
		------------------------*/

		glList.forEach( item => {

			views.push( {
				namespace: item.title,
				beforeLeave: () => {

					return this.scene.switchInfoVisibility( false );

				},
				beforeEnter: ( data ) => {

					this.scene.openContent( data.next.namespace );

				}
			} );

		} );

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
			canvas: canvas,
		} );

	}

}

window.addEventListener( 'DOMContentLoaded', ()=>{

	let app = new APP();

} );
