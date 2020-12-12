import barba, { IView } from '@barba/core';
import * as ORE from '@ore-three-ts';
import { MainVisualScene } from './MainVisualScene';
import { MainVisualManager } from './MainVisualScene/MainVisualManager';

declare global {
	interface Window {
		mainVisualManager: MainVisualManager;
		isSP: boolean;
	}
}

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

		let canvas = document.querySelector( "#canvas" ) as HTMLCanvasElement;
		this.controller = new ORE.Controller();

		this.controller.addLayer( new MainVisualScene(), {
			name: 'MainVisual',
			canvas: canvas
		} );

	}

}

window.addEventListener( 'DOMContentLoaded', ()=>{

	let app = new APP();

} );
