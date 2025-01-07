import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SurfaceWithUser = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const userRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const linesRef = useRef<any[]>([]);
  const speedRef = useRef({ x: 0.05, z: 0.05 });
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [isHoveringGrid, setIsHoveringGrid] = useState(false);
  const userPositionRef = useRef<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });
  const currentLineCountRef = useRef<number>(1); // Add this line to track current line count

  const makeLine = (scene: any, num: number) => {
    // Clear existing lines
    linesRef.current.forEach((line) => {
      scene.remove(line.mesh);
    });
    linesRef.current = [];

    // Create new lines
    for (let i = 0; i < num; i++) {
      let startPoint = {
        x: randomIntFromInterval(-10, 10),
        y: 0,
        z: randomIntFromInterval(-10, 10),
      };
      let endPoint = {
        x: randomIntFromInterval(-10, 10),
        y: 0,
        z: randomIntFromInterval(-10, 10),
      };
      const thickLine = createThickLine(startPoint, endPoint, 0xc30010);
      scene.add(thickLine);

      linesRef.current.push({
        mesh: thickLine,
        startPoint: startPoint,
        endPoint: endPoint,
        speed: { x: speedRef.current.x * (Math.random() > 0.5 ? 1 : -1) },
      });
    }
  };

  function createThickLine(startPoint: any, endPoint: any, color = 0xff0000) {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
      new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z)
    );

    const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.15, 8, false);

    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      shininess: 100,
      specular: 0x444444,
    });

    const tubeMesh = new THREE.Mesh(tubeGeometry, material);
    const startSphere = new THREE.Mesh(sphereGeometry, material);
    const endSphere = new THREE.Mesh(sphereGeometry, material);

    startSphere.position.set(startPoint.x, startPoint.y, startPoint.z);
    endSphere.position.set(endPoint.x, endPoint.y, endPoint.z);

    const lineGroup = new THREE.Group();
    lineGroup.add(tubeMesh);
    lineGroup.add(startSphere);
    lineGroup.add(endSphere);

    return lineGroup;
  }

  function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const animateLines = () => {
    if (!sceneRef.current) return;

    const linesToRemove: number[] = [];

    linesRef.current.forEach((line, index) => {
      // Remove old line
      sceneRef.current!.remove(line.mesh);

      // Update positions
      line.startPoint.x += line.speed.x;
      line.endPoint.x += line.speed.x;

      // Check boundaries
      if (
        line.startPoint.x >= 10 ||
        line.startPoint.x <= -10 ||
        line.endPoint.x >= 10 ||
        line.endPoint.x <= -10
      ) {
        linesToRemove.push(index);
      } else {
        // Create new line with updated position
        const newLine = createThickLine(
          line.startPoint,
          line.endPoint,
          0xfe347e
        );
        if (sceneRef.current) sceneRef.current.add(newLine);
        line.mesh = newLine;
      }
    });

    // Remove lines that are out of bounds
    linesToRemove.reverse().forEach((index) => {
      linesRef.current.splice(index, 1);
    });

    // If all lines are removed, increment count and create new lines
    if (linesRef.current.length === 0) {
      if (currentLineCountRef.current < 10) {
        currentLineCountRef.current++;
      } else {
        currentLineCountRef.current = 1; // Reset to 1 when reaching 10
      }
      makeLine(sceneRef.current, currentLineCountRef.current);
    }
  };

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
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add grid with plane
    const gridHelper = new THREE.GridHelper(20, 20, 0x2cff05, 0x808080);
    const gridPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    gridPlane.rotateX(-Math.PI / 2);
    gridPlane.name = "gridPlane";
    scene.add(gridHelper);
    scene.add(gridPlane);
    gridRef.current = gridHelper;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add fog
    scene.fog = new THREE.Fog(0x000000, 40, 40);

    // Add user
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
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

    const user = new THREE.Group();
    user.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
    user.position.set(0, 0, 0);
    scene.add(user);
    userRef.current = user;

    // Initialize first line
    makeLine(scene, 1);

    const handleKeyDown = (event: KeyboardEvent) => {
      const GRID_SIZE = 10;
      const newPosition = { ...userPositionRef.current };
      if (event.key === "ArrowRight") {
        newPosition.x = Math.min(newPosition.x + 0.1, GRID_SIZE);
      } else if (event.key === "ArrowLeft") {
        newPosition.x = Math.max(newPosition.x - 0.1, -GRID_SIZE);
      } else if (event.key === "ArrowUp") {
        newPosition.z = Math.max(newPosition.z - 0.1, -GRID_SIZE);
      } else if (event.key === "ArrowDown") {
        newPosition.z = Math.min(newPosition.z + 0.1, GRID_SIZE);
      } else if (event.key === " ") {
        if (newPosition.y < 2) {
          newPosition.y += 1;
          setTimeout(() => {
            userPositionRef.current.y = 0;
          }, 1000);
        }
      }
      userPositionRef.current = newPosition;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current || !sceneRef.current || !cameraRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects([
        scene.getObjectByName("gridPlane")!,
      ]);

      const isHovering = intersects.length > 0;
      setIsHoveringGrid(isHovering);

      if (isHovering) {
        scene.rotation.y = mouseRef.current.x * 0.5;
        scene.rotation.x = mouseRef.current.y * 0.5;
      } else {
        scene.rotation.y = 0;
        scene.rotation.x = 0;
      }
    };

    const handleMouseLeave = () => {
      if (sceneRef.current) {
        scene.rotation.x = 0;
        scene.rotation.y = 0;
      }
      setIsHoveringGrid(false);
    };

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

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
      userRef.current.position.z = userPositionRef.current.z;

      animateLines();

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    animate();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(renderer.domElement);
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