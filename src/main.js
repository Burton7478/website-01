import "./style.css";
import "./Style.scss";
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader.js";
import { throttle } from 'lodash-es';

import VanillaTilt from "vanilla-tilt";
import { initBoxCarousel } from "./IconChange.js";
import { gsap } from 'gsap';

import { loadAllModels } from './loadModel';



loadAllModels().then((results) => {
  console.log('load all models:', results);

  obj1 = results[0];
  obj2 = results[1];
  obj3 = results[2];


  //放在稍微偏左
  obj1.position.set(50, 50, 0);
  obj1.scale.set(0.01, 0.01, 0.01);
  scene.add(obj1);


  obj2.position.set(-50, -50, 0);
  obj2.scale.set(0.01, 0.01, 0.01);
  scene.add(obj2);


  obj3.position.set(0, 0, 0);
  obj3.scale.set(0.005, 0.005, 0.005);
  scene.add(obj3);

  // 在 obj3 内部添加高强度点光
  const innerLight = new THREE.PointLight(0xffffff, 2);
  obj3.add(innerLight);

  // 分别计算3个obj的相机位置
  const camPos1 = getCameraPositionForObj(obj1, 1.5); // 顶部 => obj1
  const camPos3 = getCameraPositionForObj(obj3, 1.5); // 中间 => obj3
  const camPos2 = getCameraPositionForObj(obj2, 1.5); // 底部 => obj2

  // timeline: paused, 我们用 progress() 来控制
  cameraTL = gsap.timeline({ paused: true });

  // 让 timeline 在 0 -> 0.5 这段区间，从 camPos1 -> camPos3
  // 再 0.5 -> 1 这段，从 camPos3 -> camPos2
  // 这样你滚动 0% =>  obj1,   50% =>  obj3,   100% =>  obj2

  // 第一个段：0~0.5
  cameraTL.fromTo(
    camera.position,
    { x: camPos1.x, y: camPos1.y, z: camPos1.z },   // 起点
    {
      x: camPos3.x,
      y: camPos3.y,
      z: camPos3.z,
      duration: 0.5, // timeline的相对长度
      onUpdate: () => {
        camera.lookAt(obj1.position); // 这里也可直接写(0,0,0) or box center
        camera.updateProjectionMatrix();
      }
    },
    0  // 起始时间
  );

  // 第二个段：0.5~1.0
  cameraTL.to(camera.position, {
    x: camPos2.x,
    y: camPos2.y,
    z: camPos2.z,
    duration: 0.5,
    onUpdate: () => {
      camera.lookAt(obj2.position); // 也可以 obj2.position, 自行选择
      camera.updateProjectionMatrix();
    }
  }, 0.5);
})


//控制网页跳转
let navLinks = document.querySelectorAll("a.inner-link");
navLinks.forEach((item) => {
  // 阻止 <a> 的默认跳转，改用 JS 来切换页面
  item.addEventListener("click", function (e) {
    e.preventDefault();

    // 1. 去掉之前链接上的 .active
    let currentActiveLink = document.querySelector("nav ul li a.active");
    if (currentActiveLink) {
      currentActiveLink.classList.remove("active");
    }
    // 2. 给自己加 .active
    item.classList.add("active");

    // 3. 找到当前显示的section，移除 .active
    let currentActiveSection = document.querySelector("main > section.active");
    if (currentActiveSection) {
      currentActiveSection.classList.remove("active");
    }

    // 4. 找到对应的 section 并加上 .active
    let targetID = item.getAttribute("href"); // #home / #work1 / ...
    let targetSection = document.querySelector(`main > section${targetID}`);
    if (targetSection) {
      targetSection.classList.add("active");
    }
  });
});

//控制卡片旋转

function setupTilt() {
  VanillaTilt.init(document.querySelectorAll(".card"), {
    max: 20, // 最大倾斜角度，再大一点会更“夸张”
    speed: 400, // 动画速度
    glare: true, // 光晕效果
    "max-glare": 0.2, // 光晕最大透明度
    perspective: 700, // 透视深度，小一点可以增强 3D 感
    scale: 1.03, // 鼠标悬停时放大比例
    "full-page-listening": false, // 是否在页面任意位置监听
    "mouse-event-element": null, // 可以自定义监听的容器
    reset: true, // 鼠标离开时重置卡片角度
    gyroscope: true, // 移动端陀螺仪支持
  });
}

setupTilt();

//控制视频播放

document.addEventListener('DOMContentLoaded', function () {
  const video = document.querySelector('.rounded-video');
  const playIcon = document.querySelector('.play-icon');

  // 初始状态：如果视频是暂停的，就显示播放图标
  if (video.paused) {
    playIcon.style.display = 'inline';
  } else {
    playIcon.style.display = 'none';
  }

  // 点击播放图标：开始/暂停切换
  playIcon.addEventListener('click', function () {
    if (video.paused) {
      video.play();
      playIcon.style.display = 'none';
    } else {
      video.pause();
      playIcon.style.display = 'inline';
    }
  });

  // 视频暂停事件 - 显示图标
  video.addEventListener('pause', function () {
    playIcon.style.display = 'inline';
  });

  // 视频结束事件 - 显示图标
  video.addEventListener('ended', function () {
    playIcon.style.display = 'inline';
  });

  // 双击全屏
  video.addEventListener('dblclick', function () {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen(); // Safari
    }
  });

});

//控制切卡功能

document.addEventListener("DOMContentLoaded", () => {

  const data1 = [
    { type: "image", src: "images/Skill/S1.png", width: 200, height: 130, alt: "Card 1", title: "VFX" },
    { type: "image", src: "images/Skill/S2.png", width: 220, height: 150, alt: "Card 2", title: "OnlineSystem" },
    { type: "image", src: "images/Skill/S3.png", width: 180, height: 120, alt: "Card 3", title: "AI" },
    { type: "image", src: "images/Skill/S4.png", width: 320, height: 240, alt: "Card 4", title: "WebSite" },
    { type: "image", src: "images/Skill/S5.png", width: 220, height: 140, alt: "Card 5", title: "Interaction Art" },
    { type: "image", src: "images/Skill/S6.png", width: 220, height: 140, alt: "Card 6", title: "Game Engine" },
  ];
  // 作用于 #work1 .container11 .box
  initBoxCarousel("#home .container2 .box", data1, "#home .container2 .Icando .dynamic-title");

  const data2 = [
    { type: "video", src: "video/v1.mp4", width: 320, height: 240 }, // 示例视频
    { type: "video", src: "video/v1.mp4", width: 320, height: 240 }, // 示例视频
    { type: "video", src: "video/v1.mp4", width: 320, height: 240 }, // 示例视频
    { type: "video", src: "video/v1.mp4", width: 320, height: 240 }, // 示例视频
  ];
  // 作用于 #work1 .container11 .box
  initBoxCarousel("#work1 .container11 .box", data2);
  // 第一次调用 => container11, 混合图片 + 视频



  const data3 = [

    { type: "video", src: "video/v1.mp4", width: 320, height: 240 }, // 示例视频
    { type: "video", src: "video/v1.mp4", width: 320, height: 240 }, // 示例视频

  ];

  initBoxCarousel("#work2 .container19 .box", data3);

  const data14 = [
    {
      type: "image",
      src: "images/Test/B4.png",
      width: 200,
      height: 130,
      alt: "Pic 1",
    },
    {
      type: "image",
      src: "images/Test/B5.png",
      width: 200,
      height: 130,
      alt: "Pic 2",
    },
    {
      type: "image",
      src: "images/Test/B6.png",
      width: 200,
      height: 130,
      alt: "Pic 3",
    },
    {
      type: "image",
      src: "images/Test/B7.png",
      width: 200,
      height: 130,
      alt: "Pic 4",
    },
  ];

  initBoxCarousel("#work3 .container24 .box", data14);

  const data15 = [
    {
      type: "image",
      src: "images/Test/B4.png",
      width: 200,
      height: 130,
      alt: "Pic 1",
    },
    {
      type: "image",
      src: "images/Test/B5.png",
      width: 200,
      height: 130,
      alt: "Pic 2",
    },
    {
      type: "image",
      src: "images/Test/B6.png",
      width: 200,
      height: 130,
      alt: "Pic 3",
    },
    {
      type: "image",
      src: "images/Test/B7.png",
      width: 200,
      height: 130,
      alt: "Pic 4",
    },
  ];

  initBoxCarousel("#work3 .container25 .box", data15);

  // 如果你还有第三次、第四次，也可以继续调
  // initBoxCarousel(...);
});


//控制场景渲染

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// 给相机一个初始位置
camera.position.set(0, 0, 30);

// OrbitControls（可鼠标旋转、缩放），可选
const controls = new OrbitControls(camera, renderer.domElement);

// // ------------------- 载入三个OBJ模型 -------------------
// const loader1 = new OBJLoader();
// const loader2 = new OBJLoader();
// const loader3 = new OBJLoader();

let obj1, obj2, obj3;

// 一些辅助函数：获取模型的包围盒中心 & 计算相机合适距离
function getObjectCenterAndSize(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  return { center, size };
}
function getCameraPositionForObj(obj, extraScale = 1.5) {
  const { center, size } = getObjectCenterAndSize(obj);
  const maxDim = Math.max(size.x, size.y, size.z);
  // 计算相机需要多远能看下整个模型
  const fovRad = (camera.fov * Math.PI) / 180;
  let cameraDist = maxDim / 2 / Math.tan(fovRad / 2);
  cameraDist *= extraScale;
  // 简化：仅在 z 方向上拉开距离，也可自由选择
  return new THREE.Vector3(center.x, center.y, center.z + cameraDist);
}



// ------------------- 星星，放在 pivotGroup 中绕中心转 -------------------
const pivotGroup = new THREE.Group();
scene.add(pivotGroup);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  // 随机位置
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);

  pivotGroup.add(star);
}
Array(350).fill().forEach(addStar);

// ------------------- 灯光（全局） -------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// 也可加一个全局点光或定向光
const pointLight = new THREE.PointLight(0xffffff, 0.2);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// ------------------- 动画循环 -------------------
function animate() {
  requestAnimationFrame(animate);

  // 星星绕中心转
  pivotGroup.rotation.y += 0.0005;

  // 如果想让obj1/obj2/obj3自转，也可以在这里加
  if (obj1) obj1.rotation.y += 0.01;
  if (obj2) obj2.rotation.y += 0.01;
  if (obj3) obj3.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ====================== GSAP + 滚动分段 ======================
// 我们想要：scroll顶部 => obj1，scroll中部 => obj3，scroll底部 => obj2
// 简单做法：用 GSAP Timeline，
//   0   -> 0.33 ->   0.66  -> 1
//   obj1 -> obj3 -> obj2
//
// 当对象还没加载完可能拿不到尺寸；我们可以在滚动时再计算（或者等加载完后再建 timeline）。
// 为了演示，这里用“延时重建 timeline”的方式保证都加载完成后再做。

let cameraTL = null; // GSAP timeline



// 监听滚动 => 更新 timeline 的 progress
window.addEventListener('scroll',
  throttle(onScroll, 1));

function onScroll() {
  console.log('onScroll')
  if (!cameraTL) return;  // timeline还没建好

  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return;

  // 滚动百分比
  let scrollPercent = scrollTop / docHeight;
  scrollPercent = Math.max(0, Math.min(1, scrollPercent));

  // 同步到 timeline
  cameraTL.progress(scrollPercent);
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


