import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Vector3 } from 'three';


// グローバル変数として追加（ファイルの先頭付近に追加）
let currentAngle = 0;
let targetAngle = 0;
let totalScroll = 0;

function main(){
    // canvas settings
    const canvas = document.querySelector('#c')
    const renderer = new THREE.WebGLRenderer({antialias:true, canvas})

    // Add raycaster for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Add event listeners
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('mousemove', onMouseMove, false);

    // Add hover state tracking
    let hoveredCard = null;
    let targetScale = 1.0;  // Add target scale value

    function onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children, true);

        // Reset previously hovered card
        if (hoveredCard) {
            hoveredCard.userData.targetScale = 1.0;  // Set target scale back to normal
            hoveredCard = null;
        }

        // Handle intersections
        for (const intersect of intersects) {
            if (intersect.object.isMesh) {
                // Check if the hovered object is a card
                if (cards.includes(intersect.object)) {
                    hoveredCard = intersect.object;
                    hoveredCard.userData.targetScale = 1.1;  // Set target scale for hover
                    break;
                }
            }
        }
    }

    function onMouseClick(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children, true);

        // Handle intersections
        for (const intersect of intersects) {
            if (intersect.object.isMesh) {
                // Check if the clicked object is a card
                if (cards.includes(intersect.object)) {
                    handleCardClick(intersect.object);
                    break;
                }
            }
        }
    }

    function handleCardClick(clickedCard) {
        // Find the index of the clicked card
        const cardIndex = cards.indexOf(clickedCard);
        
        // Add visual feedback
        clickedCard.material.emissiveIntensity = 1.0;
        
        // Reset the emissive intensity after a delay
        setTimeout(() => {
            clickedCard.material.emissiveIntensity = 0.4;
        }, 500);

        // Special handling for modeling card
        if (clickedCard.userData.link && clickedCard.userData.link.includes('modeling')) {
            // Add a special glow effect for the modeling card
            clickedCard.material.emissiveIntensity = 2.0;
            
            // Create a temporary spotlight effect
            const spotlight = new THREE.SpotLight(0xffffff, 1);
            spotlight.position.set(
                clickedCard.position.x,
                clickedCard.position.y + 2,
                clickedCard.position.z
            );
            spotlight.angle = Math.PI / 4;
            spotlight.penumbra = 0.1;
            spotlight.decay = 2;
            spotlight.distance = 10;
            scene.add(spotlight);

            // Remove the spotlight after animation
            setTimeout(() => {
                scene.remove(spotlight);
                clickedCard.material.emissiveIntensity = 0.4;
            }, 1000);
        }

        // Navigate to the corresponding link if it exists
        if (clickedCard.userData.link) {
            window.open(clickedCard.userData.link, '_blank');
        }
    }

    // camera settings
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;  // Use actual window aspect ratio
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, 0, 0)

    const scene = new THREE.Scene()

    // Add EffectComposer setup
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add UnrealBloomPass
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5,
        2,
        0.2
    );
    composer.addPass(bloomPass);

    // light settings
    const light1 = new THREE.AmbientLight("#ffffff", 0.2, 100, Math.PI / 2, 0.1, 1.2)
    // light1.position.y = camera.position.y + 3
    // light1.target.position.set(0, 0, 0); 
    scene.add(light1)
    scene.add(light1.target); 

    // // cylinder settings
    // const radiusTop = 1;  
    // const radiusBottom = 1;  
    // const height = 30;  
    // const radialSegments = 16; 
    // const geometry = new THREE.CylinderGeometry(
    //     radiusTop, radiusBottom, height, radialSegments );


    // //materials
    // const material = new THREE.MeshStandardMaterial({
    //     color: 0xaaaaaa,   // 基本色
    //     roughness: 0.5,    // 表面の粗さ（0 = 鏡面, 1 = マット）
    //     metalness: 0.3,    // 金属度（0 = 非金属, 1 = 完全な金属）
    // });

    //sylinder
    // const cube = new THREE.Mesh(geometry,material)
    // cube.position.y = -10
    // scene.add(cube)




    // Create floating ribbon
    function createRibbon() {
        // Create a more organic, flowing path
        class FlowingCurve extends THREE.Curve {
            constructor(scale = 1) {
                super();
                this.scale = scale;
            }
            getPoint(t) {
                const tx = t * 20 - 10;
                const ty = Math.sin(t * Math.PI * 4) * Math.cos(t * Math.PI * 2) * 2;
                const tz = Math.cos(t * Math.PI * 3) * Math.sin(t * Math.PI * 5) * 2;
                return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
            }
        }

        const path = new FlowingCurve(1);
        const tubeGeometry = new THREE.TubeGeometry(path, 100, 0.6, 2, false); // Increased size, fewer segments
        
        // Updated ribbon material for more glow
        const ribbonMaterial = new THREE.MeshPhongMaterial({
            color: 0x6666ff,
            emissive: 0x4444ff,
            emissiveIntensity: 0.5,  // Reduced from 1.0 to 0.5
            shininess: 80,
            transparent: true,
            opacity: 0.05,          // Reduced from 0.08 to 0.05
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        const ribbon = new THREE.Mesh(tubeGeometry, ribbonMaterial);
        ribbon.position.y = -15;
        scene.add(ribbon);

        // Second ribbon with updated parameters
        const path2 = new FlowingCurve(0.8);
        const tubeGeometry2 = new THREE.TubeGeometry(path2, 100, 0.5, 2, false);
        const ribbonMaterial2 = new THREE.MeshPhongMaterial({
            color: 0xff66ff,
            emissive: 0xff44ff,
            emissiveIntensity: 1.0,
            shininess: 80,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        const ribbon2 = new THREE.Mesh(tubeGeometry2, ribbonMaterial2);
        ribbon2.position.y = -15;
        ribbon2.rotation.y = Math.PI / 2;
        scene.add(ribbon2);

        // Third ribbon with updated parameters
        const path3 = new FlowingCurve(0.9);
        const tubeGeometry3 = new THREE.TubeGeometry(path3, 100, 0.8, 2, false); // Even wider
        const ribbonMaterial3 = new THREE.MeshPhongMaterial({
            color: 0x66ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.0,
            shininess: 80,
            transparent: true,
            opacity: 0.06,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        const ribbon3 = new THREE.Mesh(tubeGeometry3, ribbonMaterial3);
        ribbon3.position.y = -15;
        ribbon3.rotation.y = Math.PI / 4;
        scene.add(ribbon3);

        return [ribbon, ribbon2, ribbon3];
    }

    const ribbons = createRibbon();

    // Add after the scene creation
    const fog = new THREE.FogExp2(0x000020, 0.015);
    scene.fog = fog;

    // Add particle system after scene creation
    function createParticles() {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for(let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            velocities.push(new Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            ));
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x88ccff,
            size: 0.1,
            transparent: true,
            opacity: 0.3,  // Reduced from 0.6 to 0.3
            blending: THREE.AdditiveBlending
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);
        return { particleSystem, positions, velocities };
    }

    const particles = createParticles();


    let cards = []


    let counter = 0;

    async function loadCards() {
        try {
            const response = await fetch('data.json'); // Ensure data.json is accessible
            const data = await response.json();
    
            if (data.contents && Array.isArray(data.contents)) {
                data.contents.forEach((item, index) => {
                    counter++
                    cards.push(makeInstance(index, item));
                });
            }
        } catch (error) {
            console.error("Error loading cards:", error);
        }
    }

    loadCards()


    function makeInstance(index,item){
        let textureLoader = new THREE.TextureLoader();
        let texture = textureLoader.load("imgs/"+item["img_path"]); // 画像を読み込む
    
    
        let material2 = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: texture,
            roughness: 0.1,       // Reduced for more shine
            metalness: 0.2,       // Slight metallic feel
            transparent: true,
            opacity: 1,           // Full opacity
            emissive: 0xffffff,   // Add white emissive glow
            emissiveMap: texture, // Use same texture for emissive
            emissiveIntensity: 0.4,  // Add moderate emissive glow
        });
    
    
        const boxWidth = 4.5;
        const boxHeight = 3;
        const boxDepth = 0.05;
        const geometry2 = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );
    
        const cube = new THREE.Mesh(geometry2, material2);
        scene.add(cube)

        // Store link information in the cube object
        cube.userData.link = item.link;

        const radius = 5;
        cube.position.x = Math.cos(-Math.PI / 3 * index) * radius;
        cube.position.z = Math.sin(-Math.PI / 3 * index) * radius;
        cube.position.y = -index * 1.5;  // Reduced vertical spacing
        cube.lookAt(0, -index * 1.5, 0);  // Adjusted lookAt to match new y position

        
        
        
        // フォントローダーのセットアップ
        const loader = new FontLoader();
        
        // Use gentilis_regular font for a cursive look
        loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/gentilis_bold.typeface.json', function (font) {
            const geometry = new TextGeometry(item["title-text"], {
                font: font,
                size: 0.42,        // Even smaller size
                depth: 0.005,      // Much thinner depth
                curveSegments: 12, // Increased for smoother curves
                bevelEnabled: true,
                bevelThickness: 0.003, // Smaller bevel
                bevelSize: 0.003,      // Smaller bevel
                bevelSegments: 5,
            });

            geometry.center();

            // Enhanced glowing material for text with adjusted colors
            const material = new THREE.MeshPhongMaterial({
                color: item["color"],
                shininess: 100,
                specular: item["color"],
                emissive: item["color"],
                emissiveIntensity: 1.2,  // Increased glow to compensate for thinner text
                transparent: true,
                opacity: 0.95
            });

            // Enhanced outline material with thinner outline
            const outlineMaterial = new THREE.MeshPhongMaterial({
                color: 0x151a48,
                emissive: 0x151a48,
                emissiveIntensity: 0.4,
                side: THREE.BackSide,
                transparent: true,
                opacity: 0.8
            });

            // Create main text mesh
            const textMesh = new THREE.Mesh(geometry, material);
            
            // Create outline mesh with thinner outline
            const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
            outlineMesh.scale.multiplyScalar(1.02); // Reduced from 1.05 for thinner outline
            
            // Create a group to hold both meshes
            const textGroup = new THREE.Group();
            textGroup.add(textMesh);
            textGroup.add(outlineMesh);

            // Position the group instead of individual mesh
            textGroup.position.x = Math.cos(-Math.PI / 3 * index) * (radius + 0.1);
            textGroup.position.z = Math.sin(-Math.PI / 3 * index) * (radius + 0.1);
            textGroup.position.y = -index * 1.5 + 1.1;
            textGroup.lookAt(0, -index * 1.5 + 1.1, 0);
            textGroup.rotateY(Math.PI);

            // Add animation
            const originalY = textGroup.position.y;
            const floatAnimation = () => {
                textGroup.position.y = originalY + Math.sin(Date.now() * 0.002) * 0.03;
                requestAnimationFrame(floatAnimation);
            };
            floatAnimation();

            scene.add(textGroup);
        });

        // Add ambient light to better illuminate the cards
        const cardLight = new THREE.PointLight(0xffffff, 1, 5);
        cardLight.position.set(
            cube.position.x,
            cube.position.y,
            cube.position.z + 1
        );
        scene.add(cardLight);

        // Enhanced glow animation
        function animateCubeGlow() {
            cube.material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.002) * 0.2;
            cardLight.intensity = 1 + Math.sin(Date.now() * 0.002) * 0.3;
        }
        
        const animate = () => {
            animateCubeGlow();
            requestAnimationFrame(animate);
        };
        animate();

        return cube;
    }


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

    // ホイールイベントリスナーを更新
    window.addEventListener("wheel", (event) => {
        totalScroll += event.deltaY;
        
        if(totalScroll < 0){
            totalScroll = 0;
        }
        else if(totalScroll > (counter-1)*1047){
            totalScroll = (counter-1)*1047;
        }
        targetAngle = -totalScroll * 0.001;
    });

    // Add touch event support for mobile devices
    let touchStartY = 0;
    let lastTouchY = 0;

    window.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
        lastTouchY = touchStartY;
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const touchY = event.touches[0].clientY;
        const deltaY = lastTouchY - touchY;
        
        totalScroll += deltaY * 4; // Multiply by 2 to make scrolling more responsive
        
        if(totalScroll < 0){
            totalScroll = 0;
        }
        else if(totalScroll > (counter-1)*1047){
            totalScroll = (counter-1)*1047;
        }
        targetAngle = -totalScroll * 0.001;
        
        lastTouchY = touchY;
    }, { passive: false });

    window.addEventListener('touchend', () => {
        touchStartY = 0;
        lastTouchY = 0;
    }, { passive: true });

    // 補間関数を追加
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // アニメーション関数を更新
    function animate() {
        requestAnimationFrame(animate);
        
        // スムーズな補間を適用
        currentAngle = lerp(currentAngle, targetAngle, 0.05);

        // Smooth scale animation for all cards
        cards.forEach(card => {
            const targetScale = card.userData.targetScale || 1.0;
            const currentScale = card.scale.x;
            const newScale = lerp(currentScale, targetScale, 0.2);
            card.scale.set(newScale, newScale, newScale);
        });

        // カメラをY軸中心に回転させる
        const radius = window.innerWidth <= 768 ? 10 : 7; // Larger radius for mobile devices
        camera.position.x = Math.cos(currentAngle) * radius;
        camera.position.z = Math.sin(currentAngle) * radius;
        camera.position.y = currentAngle * 1.433;  // Reduced vertical camera movement
        camera.lookAt(0, camera.position.y, 0);

        // Update camera aspect ratio on resize
        if(resizeRendererToDisplaySize(renderer)){
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            composer.setSize(canvas.width, canvas.height);
        }

        // Update the ribbon animation section
        ribbons.forEach((ribbon, index) => {
            // Rotate the angle of the ribbon itself around x-axis
            const time = Date.now() * 0.001;
            ribbon.rotation.x = time + index * Math.PI / 3;  // Changed from rotation.y to rotation.x
            
            // Vertical movement
            ribbon.position.y = -20 + Math.sin(Date.now() * 0.0005 + index * Math.PI / 3) * 15;
            
            // Existing scale animation
            ribbon.scale.y = 1 + Math.sin(Date.now() * 0.001 + index * Math.PI / 3) * 0.3;
            ribbon.scale.x = 1 + Math.cos(Date.now() * 0.001 + index * Math.PI / 3) * 0.2;

            // Existing opacity and emissive animations
            ribbon.material.opacity = 0.03 + Math.sin(Date.now() * 0.002 + index * Math.PI / 3) * 0.05;
            ribbon.material.emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.001 + index * Math.PI / 3) * 0.3;

            // Add color transition
            const hue = (time * 0.1 + index * 0.2) % 1;
            ribbon.material.color.setHSL(hue, 0.8, 0.5);
            ribbon.material.emissive.setHSL(hue, 0.8, 0.3);
        });

        // Add a subtle pulse animation to the cards in the animate function
        cards.forEach((card, index) => {
            // Animate emissive properties
            card.material.emissiveIntensity = 0.2 + Math.sin(Date.now() * 0.002 + index * 0.5) * 0.003;
        });

        // Animate particles
        const positions = particles.particleSystem.geometry.attributes.position.array;
        for(let i = 0; i < positions.length; i += 3) {
            positions[i] += particles.velocities[i/3].x;
            positions[i + 1] += particles.velocities[i/3].y;
            positions[i + 2] += particles.velocities[i/3].z;
            
            // Reset particles that go too far
            if(Math.abs(positions[i]) > 25) positions[i] = (Math.random() - 0.5) * 50;
            if(Math.abs(positions[i + 1]) > 25) positions[i + 1] = (Math.random() - 0.5) * 50;
            if(Math.abs(positions[i + 2]) > 25) positions[i + 2] = (Math.random() - 0.5) * 50;
        }
        particles.particleSystem.geometry.attributes.position.needsUpdate = true;

        // Replace renderer.render with composer.render
        composer.render();
    }

    animate();

    // Add this function after scene creation but before animation
    function loadSword() {
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
            'imgs/sword.fbx', // Update this path to where your sword.fbx is located
            (object) => {
                // Ensure object is traversed to modify materials
                object.traverse((child) => {
                    if (child.isMesh) {
                        // Add emissive effect
                        child.material.emissive = new THREE.Color(0xaaaaaaa); // Green glow
                        child.material.emissiveIntensity = 1.0; // Adjust intensity
                        child.material.needsUpdate = true;
                    }
                });

                // Scale and position adjustments
                object.scale.setScalar(2);
                object.position.set(41, -10, 0.8);
                
                // Add to scene
                scene.add(object);


            },
            (progress) => {
                console.log('Loading sword...', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading sword:', error);
            }
        );
    }

    // Call the function after scene creation
    loadSword();
}


main();