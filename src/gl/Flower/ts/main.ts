import * as ORE from '@ore-three-ts';
import { ExampleScene } from './ExampleScene/';

class APP {

	private canvas: HTMLCanvasElement;
	private controller: ORE.Controller;
	private scene: ExampleScene;

	constructor() {

		this.canvas = document.querySelector( "#canvas" );
		this.controller = new ORE.Controller();

		this.scene = new ExampleScene();
		this.controller.addLayer( this.scene, {
			name: 'Main',
			canvas: this.canvas,
		} );

	}

}

window.addEventListener( 'load', ()=>{

	let app = new APP();

} );
