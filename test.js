import * as THREE from "three";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// シーンのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 200);

// レンダラーのセットアップ
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ライトのセットアップ
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// カメラコントロールの追加
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// フォントローダーのセットアップ
const loader = new FontLoader();

loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
	const geometry = new TextGeometry('Hello three.js!', {
		font: font,
		size: 80,
		height: 0.,        // depth を height に変更（新しいバージョンの Three.js での推奨）
		curveSegments: 12,
		bevelEnabled: true,
		bevelThickness: 10,
		bevelSize: 8,
		bevelOffset: 0,
		bevelSegments: 5
	});

	// テキストを中央に配置
	geometry.center();

	// マテリアルとメッシュの作成
	const material = new THREE.MeshPhongMaterial({
		color: 0x6699ff,    // 水色
		shininess: 100,
		specular: 0x444444  // 光の反射
	});
	const textMesh = new THREE.Mesh(geometry, material);
	scene.add(textMesh);
});

// アニメーションループ
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});