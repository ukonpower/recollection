import barba, { IView } from '@barba/core';
import * as ORE from '@ore-three-ts';
import { MainVisualScene } from './MainVisualScene';

class APP {

	private controller: ORE.Controller;

	constructor() {

		this.initBarba();
		this.initORE();

	}

	private initBarba() {

		let glList: string[] = [
			'main',
		];

		let views: IView[] = [];

		for ( let i = 0; i < glList.length; i ++ ) {

			views.push( {
				namespace: glList[ i ],
				beforeEnter: () => {
				},
				afterEnter: () => {
				},
				beforeLeave: () => {
				}
			} );

		}

		barba.init( {
			transitions: [
				{
					leave: () => {
					},
					enter: () => {
					},
					afterEnter: () => {
					}
				}
			],
			views: views
		} );

	}

	private initORE() {

		this.controller = new ORE.Controller( {
			canvas: document.querySelector( "#canvas" ) as HTMLCanvasElement,
			retina: true
		} );

		this.controller.bindScene( new MainVisualScene() );

	}

}

window.addEventListener( 'DOMContentLoaded', ()=>{

	let app = new APP();

} );
