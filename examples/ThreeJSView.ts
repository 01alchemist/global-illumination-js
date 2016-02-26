import {MathUtils} from "../src/engine/utils/MathUtils";
/**
 * Created by Nidin Vinayakan on 26/2/2016.
 */
export class ThreeJSView {

    camera;
    scene;
    model;
    renderer;
    mouseX;
    mouseY;
    windowHalfX;
    windowHalfY;

    constructor(width, height, container) {
        var self = this;
        this.mouseX = 0;
        this.mouseY = 0;
        this.windowHalfX = width / 2;
        this.windowHalfY = height / 2;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
        this.camera.position.y = 10;
        this.camera.position.z = 10;
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        // scene
        this.scene = new THREE.Scene();
        this.scene.position.x = 0;
        this.scene.position.y = 0;
        var ambient = new THREE.AmbientLight(0x101030);
        this.scene.add(ambient);
        var directionalLight = new THREE.DirectionalLight(0xffeedd, 1);
        directionalLight.castShadow = true;
        directionalLight.position.set(0, 1, 0);
        this.scene.add(directionalLight);
        // texture
        var manager = new THREE.LoadingManager();
        manager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };
        var texture = new THREE.Texture();
        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 2) + '% downloaded');
            }
        };
        var onError = function (xhr) {
        };
        /*var loader = new THREE.ImageLoader( manager );
         loader.load( 'textures/UV_Grid_Sm.jpg', function ( image ) {
         texture.image = image;
         texture.needsUpdate = true;
         } );*/
        // model

        var geometry = new THREE.PlaneGeometry( 200, 200);
        var material = new THREE.MeshPhongMaterial( { color: 0xCFCFCF} );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.rotation.set(MathUtils.radians(-90), 0,0);
        mesh.receiveShadow = true;
        this.scene.add( mesh );

        var loader = new THREE.OBJLoader(manager);
        loader.load('teapot.obj', function (object) {
            self.model = object;
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    //child.material.map = texture;
                    child.material.color = new THREE.Color(1,0,0);
                    child.castShadow = true;
                }
            });
            //object.position.y = -95;
            self.scene.add(object);
        }, onProgress, onError);
        //
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        container.appendChild(this.renderer.domElement);

        document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);

        this.animate();
    }

    onDocumentMouseMove(event) {
        this.mouseX = ( event.clientX - this.windowHalfX ) / 2;
        this.mouseY = ( event.clientY - this.windowHalfY ) / 2;
    }

    //
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    render() {
        //this.camera.position.x += ( this.mouseX - this.camera.position.x ) * .05;
        //this.camera.position.y += ( -this.mouseY - this.camera.position.y ) * .05;
        //this.camera.lookAt(this.scene.position);
        //this.model.rotation
        this.renderer.render(this.scene, this.camera);
    }
}