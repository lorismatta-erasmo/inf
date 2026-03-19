// Animazione di zoom isolata
// Questa funzione sposta la camera verso un pianeta per lo zoom

// Variabili necessarie
let zooming = false;
let scrollDisabled = false;
let isZoomedOnPlanet = false;
let zoomedPlanetIndex = -1;

// Target della camera
const camTarget = new THREE.Vector3(0, 0, 0);

// Array dei pianeti (da definire o passare)
let planets = []; // Assumi che sia definito altrove

// Funzione di zoom
function smoothZoomTo(obj, planetIndex, done) {
    zooming = true;
    scrollDisabled = true;
    isZoomedOnPlanet = true;
    zoomedPlanetIndex = typeof planetIndex === 'number' ? planetIndex : zoomedPlanetIndex;
    const fromPos = camera.position.clone();
    // Offset per la posizione della camera
    const offset = 350;
    const toPos = new THREE.Vector3().copy(obj.position).add(new THREE.Vector3(0, 0, offset));
    const fromLook = camTarget.clone();
    const toLook = obj.position.clone();
    let progress = 0;
    const duration = 1600; // ms
    const start = performance.now();
    function step(now) {
        const p = Math.min(1, (now - start) / duration);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        camera.position.lerpVectors(fromPos, toPos, e);
        camTarget.lerpVectors(fromLook, toLook, e);
        if (p < 1) requestAnimationFrame(step);
        else {
            zooming = false;
            scrollDisabled = false;
            if (done) done();
        }
    }
    requestAnimationFrame(step);
}

// Esponi la funzione globalmente
window.smoothZoomTo = smoothZoomTo;