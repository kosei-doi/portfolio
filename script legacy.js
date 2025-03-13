import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


function main(){
    // canvas settings
    const canvas = document.querySelector('#c')
    const renderer = new THREE.WebGLRenderer({antialias:true, canvas})

    // camera settings
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.x = 0
    camera.position.y = -40
    camera.position.z = 50;

    const scene = new THREE.Scene()

    // light settings
    const light1 = new THREE.DirectionalLight(0xffffff, 1, 100, Math.PI / 6, 0.3, 2)
    light1.position.y = camera.position.y + 3
    scene.add(light1)

    // cylinder settings
    const radiusTop = 1;  
    const radiusBottom = 1;  
    const height = 30;  
    const radialSegments = 16; 
    const geometry = new THREE.CylinderGeometry(
        radiusTop, radiusBottom, height, radialSegments );


    //materials
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,   // 基本色
        roughness: 0.5,    // 表面の粗さ（0 = 鏡面, 1 = マット）
        metalness: 0.3,    // 金属度（0 = 非金属, 1 = 完全な金属）
    });

    const material2 = new THREE.MeshStandardMaterial({
        color: 0xff00ff,   // 基本色
        roughness: 0.5,    // 表面の粗さ（0 = 鏡面, 1 = マット）
        metalness: 0.3,    // 金属度（0 = 非金属, 1 = 完全な金属）
    });
    

    const cube = new THREE.Mesh(geometry,material)
    cube.position.y = -10
    scene.add(cube)


    function makeInstance(index){
        const boxWidth = 3;
        const boxHeight = 3;
        const boxDepth = 0.1;
        const geometry2 = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );
    
        const cube = new THREE.Mesh(geometry2,material2)
        scene.add(cube)

        const radius = 5; // 回転の半径
        cube.position.x = Math.cos(-Math.PI / 3 * index) * radius;
        cube.position.z = Math.sin(-Math.PI / 3 * index) * radius;
        cube.position.y = -index*2
        cube.lookAt(0,-index*2,0);

        return cube;
    }

    const cards = [
        makeInstance(0),
        makeInstance(1),
        makeInstance(2),
        makeInstance(3),
        makeInstance(4),
        makeInstance(5),
        makeInstance(6),
        makeInstance(7),
        makeInstance(8),
        makeInstance(9),
        makeInstance(10),
        makeInstance(11),
        makeInstance(12),
        makeInstance(13),
        makeInstance(14),

    ]



    // resize function
    function resizeRendererToDisplaySize(render){
        const canvas = renderer.domElement
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        const needResize = canvas.width !== width || canvas.height !== height
        if(needResize){
            renderer.setSize(width,height,false)
        }
        return needResize
    }   

    window.addEventListener("wheel", () => {
        let angle = -window.scrollY*0.003;

        console.log(angle)

        // // カメラをY軸中心に回転させる
        const radius = 70; // 回転の半
        camera.position.x = Math.cos(angle) * radius;
        camera.position.z = Math.sin(angle) * radius;
        camera.position.y = 0
        camera.lookAt(0, -50, 0); // 原点を常に見る

        // カメラをY軸中心に回転させる
        light1.position.x = camera.position.x;
        light1.position.z = camera.position.z + 5;
        // light1.position.y = camera.position.y + 3
        light1.lookAt(0, camera.position.y, 0); // 原点を常に見る

                
    });
    

    // render update function
    function render(time){
        time *= 0.0005

        //resize function
        if(resizeRendererToDisplaySize(renderer)){
            const canvas = renderer.domElement
            camera.aspect = canvas.clientWidth / canvas.clientHeight
            camera.updateProjectionMatrix();
        }
        renderer.render(scene,camera,light1)

        requestAnimationFrame(render)

    }

    requestAnimationFrame(render)

}


main()