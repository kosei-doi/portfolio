import * as THREE from "three"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { Vector3 } from "three"

let currentAngle = 0
let targetAngle = 0
let totalScroll = 0

function main(){
    const canvas = document.querySelector("#c")
    const renderer = new THREE.WebGLRenderer({antialias:true,canvas})

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    window.addEventListener("click",onMouseClick,false)

    function onMouseClick(event) { 
        const rect = canvas.getBoundingClientRect()
        mouse.x = ((event.clientX - ))
    }

}