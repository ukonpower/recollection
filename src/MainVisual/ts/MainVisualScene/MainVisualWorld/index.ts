import * as THREE from 'three';
import * as ORE from '@ore-three-ts';

import basicVert from './shaders/basic.vs';
import basicFrag from './shaders/basic.fs';

import { ReflectionPlane } from '../ReflectionPlane';
import { AssetManager } from '../MainVisualManager/AssetManager';
import { Particle } from './Particle';
import { Trails } from './Trails';
import { Dust } from './Dust';

export class MainVisualWorld {

	private commonUniforms: ORE.Uniforms;
	private scene: THREE.Scene;

	private assetManager: AssetManager;s
	private renderer: THREE.WebGLRenderer;

	public refPlane: ReflectionPlane;
	public particle: Particle;
	public dust: Dust;
	public trails: Trails;

	constructor( assetManager: AssetManager, renderer: THREE.WebGLRenderer, scene: THREE.Scene, parentUniforms: ORE.Uniforms ) {

		this.assetManager = assetManager;

		this.renderer = renderer;
		this.scene = scene;

		this.commonUniforms = ORE.UniformsLib.CopyUniforms( {

		}, parentUniforms );

		let groundModel = this.scene.getObjectByName( 'GroundModel' );
		groundModel.visible = false;

		let pLight = new THREE.PointLight();
		pLight.distance = 10.0;
		pLight.position.set( 0, 1, 0 );
		pLight.intensity = 2.0;
		this.scene.add( pLight );

		this.refPlane = new ReflectionPlane( this.assetManager, this.renderer, new THREE.Vector2( 1000, 1000 ), 0.3, this.commonUniforms );
		this.refPlane.rotation.x = - Math.PI / 2;
		this.scene.add( this.refPlane );

		this.trails = new Trails( this.renderer, 50, 100, this.commonUniforms );
		this.trails.visible = false;
		this.scene.add( this.trails );

		this.dust = new Dust( this.commonUniforms );
		this.dust.visible = false;
		this.scene.add( this.dust );

		// this.particle = new Particle( this.renderer, this.commonUniforms );
		// this.particle.position.y = 1.0;
		// this.scene.add( this.particle );

	}

	public update( deltaTime: number ) {

		this.trails.update();
		// this.particle.update( deltaTime );

	}

	public resize( args: ORE.ResizeArgs ) {

		this.refPlane.resize( args.windowSize );

	}

}
