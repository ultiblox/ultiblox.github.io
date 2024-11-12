function initializeSTLViewer(containerId, stlPath) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xeeeeee);
  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5).normalize();
  scene.add(light);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  const loader = new THREE.STLLoader();
  loader.load(stlPath, function (geometry) {
    const material = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const center = bbox.getCenter(new THREE.Vector3());
    geometry.translate(-center.x, -center.y, -center.z);

    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const cameraZ = maxDim * 1.5 / Math.tan(camera.fov * Math.PI / 360);
    camera.position.set(0, 0, cameraZ);
    camera.lookAt(0, 0, 0);
  });

  function resizeRenderer() {
    const width = container.offsetWidth;
    const height = 300; // Adjust height to fit the viewport
    renderer.setSize(width, height); // Ensure the renderer resizes
    container.style.height = `${height}px`; // Update the container's height dynamically
    camera.aspect = width / height; // Update the camera aspect ratio
    camera.updateProjectionMatrix();
}

  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
  animate();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
}
