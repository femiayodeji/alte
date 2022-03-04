import * as THREE from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import pngImages from "../assets/*.png";

export default class Crystal{
    constructor(scene, group) {
        // helper
        scene.add( new THREE.AxesHelper( 50 ) );
        // textures
        const loader = new THREE.TextureLoader();
        const texture = loader.load(pngImages["disc"]);

        group = new THREE.Group();
        scene.add( group );
        // points
        let dodecahedronGeometry = new THREE.DodecahedronGeometry( 50 );

        dodecahedronGeometry.deleteAttribute( 'normal' );
        dodecahedronGeometry.deleteAttribute( 'uv' );

        dodecahedronGeometry = BufferGeometryUtils.mergeVertices( dodecahedronGeometry );

        const vertices = [];
        const positionAttribute = dodecahedronGeometry.getAttribute( 'position' );

        for ( let i = 0; i < positionAttribute.count; i ++ ) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute( positionAttribute, i );
            vertices.push( vertex );
        }

        const pointsMaterial = new THREE.PointsMaterial( {

            color: 0x0080ff,
            map: texture,
            size: 1,
            alphaTest: 0.5

        } );

        const pointsGeometry = new THREE.BufferGeometry().setFromPoints( vertices );

        const points = new THREE.Points( pointsGeometry, pointsMaterial );
        group.add( points );

        // convex hull

        const meshMaterial = new THREE.MeshLambertMaterial( {
            color: 0xffffff,
            opacity: 0.5,
            transparent: true
        } );

        const meshGeometry = new ConvexGeometry( vertices );

        const mesh1 = new THREE.Mesh( meshGeometry, meshMaterial );
        mesh1.material.side = THREE.BackSide; // back faces
        mesh1.renderOrder = 0;
        mesh1.position.y = 100;

        group.add( mesh1 );

        const mesh2 = new THREE.Mesh( meshGeometry, meshMaterial.clone() );
        mesh2.material.side = THREE.FrontSide; // front faces
        mesh2.renderOrder = 1;
        mesh2.position.y = 100;
        group.add( mesh2 );

    }
}