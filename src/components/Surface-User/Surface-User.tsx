import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const SurfaceWithUser = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const userRef = useRef<THREE.Group | null>(null);
  const userPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x0088ff, 0x808080);
    scene.add(gridHelper);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add fog
    scene.fog = new THREE.Fog(0x000000, 20, 40);

    // Add user to the scene
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
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
    user.position.set(0, 0, 0);
    scene.add(user);
    userRef.current = user;

    // Handle keydown events for movement
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        userPositionRef.current.x += 0.1;
      } else if (event.key === "ArrowLeft") {
        userPositionRef.current.x -= 0.1;
      } else if (event.key === " ") {
        userPositionRef.current.y += 1;
        setTimeout(() => {
          userPositionRef.current.y -= 1;
        }, 1000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Animation loop
    const animate = () => {
      if (
        !userRef.current ||
        !rendererRef.current ||
        !sceneRef.current ||
        !cameraRef.current
      )
        return;

      requestAnimationFrame(animate);
      userRef.current.position.x = userPositionRef.current.x;
      userRef.current.position.y = userPositionRef.current.y;

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
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
