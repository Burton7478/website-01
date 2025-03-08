import { OBJLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader.js";

export function loadAllModels() {
    return Promise.all([
        loadModel('RobotX'),
        loadModel('PawnA'),
        loadModel('Hert')
    ]).then((results) => {
        return Promise.resolve(results);
    })
}

function loadModel(name) {
    const loader = new OBJLoader();
    return new Promise((resolve, reject) => {
        loader.load(
            `/models/${name}.obj`,
            (o) => {
                return resolve(o)
            },
            undefined,
            (err) => console.error("Obj1 加载错误", err)
        );
    })

}


// // 1) RobotX
// loader1.load(
//     '/models/RobotX.obj',
//     (o) => {
//         obj1 = o;
//         // 放在稍微偏左
//         obj1.position.set(50, 50, 0);
//         obj1.scale.set(0.01, 0.01, 0.01);
//         scene.add(obj1);
//     },
//     undefined,
//     (err) => console.error("Obj1 加载错误", err)
// );

// // 2) PawnA
// loader2.load(
//     '/models/PawnA.obj',
//     (o) => {
//         obj2 = o;
//         // 放在稍微偏右
//         obj2.position.set(-50, -50, 0);
//         obj2.scale.set(0.01, 0.01, 0.01);
//         scene.add(obj2);
//     },
//     undefined,
//     (err) => console.error("Obj2 加载错误", err)
// );

// // 3) Hert
// loader3.load(
//     '/models/Hert.obj',
//     (o) => {
//         obj3 = o;
//         obj3.position.set(0, 0, 0);
//         obj3.scale.set(0.005, 0.005, 0.005);
//         scene.add(obj3);

//         // 在 obj3 内部添加高强度点光
//         const innerLight = new THREE.PointLight(0xffffff, 2);
//         obj3.add(innerLight);
//     },
//     undefined,
//     (err) => console.error("Obj3 加载错误", err)
// );