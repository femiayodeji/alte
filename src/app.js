import * as THREE from 'three'
import images from "../assets/*.jpg";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { io } from "socket.io-client";
import Crystal from "./crystal";

let camera, controls, scene, group, renderer, socket;

const blind = document.getElementById("blind");

init();
animate();

function init(){
    socket = io("https://altecore.herokuapp.com");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc)
    scene.fog = new THREE.FogExp2(0xcccccc, 0.002)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const fov = 60
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(400, 200, 0);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;
    controls.addEventListener("change", (e) => {
        const {x, y, z} = camera.position;
        socket.emit('camera_move', {x,y,z});
    })

    socket.on('camera_move', (data) => {
        if(blind.checked){
            camera.position.set(data.x, data.y, data.z);
            console.log("Camera: ", data)
        }
    });

    const pyramidGeometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    const pyramidMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
    for (let i = 0; i < 500; i ++) {

        const pyramidMesh = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        pyramidMesh.position.x = Math.random() * 1600 - 800;
        pyramidMesh.position.y = 0;
        pyramidMesh.position.z = Math.random() * 1600 - 800;
        pyramidMesh.updateMatrix();
        pyramidMesh.matrixAutoUpdate = false;
        scene.add(pyramidMesh);
    }

    const boxTexture = new THREE.TextureLoader().load(images["wood-skin"]);
    const boxGeometry = new THREE.BoxGeometry( 100, 150, 200 );
    const boxMaterial = new THREE.MeshBasicMaterial( { map: boxTexture } );
    const box = new THREE.Mesh( boxGeometry, boxMaterial );
    box.position.x = -500;
    box.position.y = 60;
    box.updateMatrix();
    scene.add(box);

    new Crystal(scene, group);

    const dirLight1 = new THREE.DirectionalLight(0xffffff);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x002288);
    dirLight2.position.set(- 1, - 1, - 1);
    scene.add(dirLight2);
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    render();
};

function render() {
    renderer.render(scene, camera);
}

animate();
