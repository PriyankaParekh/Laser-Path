import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const SurfaceWithUser = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const userRef = useRef(null);
  const userPositionRef = useRef({ x: 0, y: 0 }); // Store user position in useRef

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1); // Black background
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    // console.log(renderer.getSize(), "e");

    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x0088ff, 0x808080);
    scene.add(gridHelper);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add fog
    scene.fog = new THREE.Fog(0x000000, 20, 40);

    // Add user to the scene
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White user material
      metalness: 0.2,
      roughness: 0.5,
    });

    // User geometry
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 2;

    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
    const body = new THREE.Mesh(bodyGeometry, material);

    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 32);
    const leftArm = new THREE.Mesh(armGeometry, material);
    leftArm.position.set(-0.75, 1.25, 0);
    leftArm.rotation.z = Math.PI / 4;

    const rightArm = new THREE.Mesh(armGeometry, material);
    rightArm.position.set(0.75, 1.25, 0);
    rightArm.rotation.z = -Math.PI / 4;

    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
    const leftLeg = new THREE.Mesh(legGeometry, material);
    leftLeg.position.set(-0.3, -0.75, 0);

    const rightLeg = new THREE.Mesh(legGeometry, material);
    rightLeg.position.set(0.3, -0.75, 0);

    // Group user parts
    const user = new THREE.Group();
    user.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
    user.position.set(0, 0, 0); // Position user at the center of the scene
    scene.add(user);
    userRef.current = user;

    // const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    // const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    //   new THREE.Vector3(random.x, 0, 0), // Start position
    //   new THREE.Vector3(random.x, random.y, 0), // End position
    // ]);
    // console.log(lineGeometry, lineMaterial, "kllpo");
    // const line = new THREE.Line(lineGeometry, lineMaterial);
    // scene.add(line);

    // console.log(scene, "s");

    // Handle keydown events for movement
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        userPositionRef.current.x += 0.1; // Move right
      } else if (event.key === "ArrowLeft") {
        userPositionRef.current.x -= 0.1; // Move left
      }
      //    else if (event.key === "ArrowUp") {
      //     userPositionRef.current.z += 0.1; // Move up
      //     //   userPositionRef.current.y += 0.1;
      //   } else if (event.key === "ArrowDown") {
      //     userPositionRef.current.z -= 0.1; // Move down
      //     console.log(userPositionRef);
      //     //   userPositionRef.current.y -= 0.1;
      //   }
      else if (event.key === " ") {
        userPositionRef.current.y += 1; // Move up
        setTimeout(() => {
          userPositionRef.current.y -= 1; // Move back down after 1 second
        }, 1000);
      }
    };

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // const createRandomLine = () => {
    //   const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    //   const points = [];

    //   // Generate random points within grid range
    //   const xStart = Math.floor(Math.random() * 20) - 10; // Random between -10 and 10
    //   const xEnd = Math.floor(Math.random() * 20) - 10;
    //   const yStart = Math.floor(Math.random() * 20) - 10;
    //   const yEnd = Math.floor(Math.random() * 20) - 10;

    //   points.push(new THREE.Vector3(xStart, yStart, 0)); // Starting point
    //   points.push(new THREE.Vector3(xEnd, yEnd, 0)); // Ending point

    //   const geometry = new THREE.BufferGeometry().setFromPoints(points);
    //   const line = new THREE.Line(geometry, material);
    //   scene.add(line);
    // };

    // const lineInterval = setInterval(createRandomLine, 1000);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      // Update user position based on ref
      user.position.x = userPositionRef.current.x;
      user.position.y = userPositionRef.current.y;

      // Rotate the grid and user slightly for effect
      //   gridHelper.rotation.y += 0.001;
      //   user.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    animate();

    // Cleanup on component unmount
    return () => {
    //   clearInterval(lineInterval);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default SurfaceWithUser;
