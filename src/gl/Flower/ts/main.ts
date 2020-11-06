import * as ORE from '@ore-three-ts';
import { Example1Scene } from './ExampleScene/';

class APP {

	private canvas: HTMLCanvasElement;
	private controller: ORE.Controller;
	private scene: Example1Scene;

	constructor() {

		this.canvas = document.querySelector( "#canvas" );

		this.controller = new ORE.Controller( {
			canvas: this.canvas,
			retina: true,
		} );

		this.scene = new Example1Scene();
		this.controller.bindScene( this.scene );

	}

}

window.addEventListener( 'load', ()=>{

	let app = new APP();

} );
