// Variabili necessarie
let zooming = false;
let scrollDisabled = false;
let isZoomedOnPlanet = false;
let zoomedPlanetIndex = -1;

// Target della camera
const camTarget = new THREE.Vector3(0, 0, 0);

// Funzione di dezoom
function resetToHome(done) {
    zooming = true;
    scrollDisabled = true;
    isZoomedOnPlanet = false;
    
    // FIX 1: Resettiamo l'indice del pianeta! 
    // Altrimenti lo zoom successivo potrebbe bloccarsi se clicchi lo stesso pianeta.
    zoomedPlanetIndex = -1; 

    const fromPos = camera.position.clone();
    const toPos = new THREE.Vector3(0, 0, 1200);
    const fromLook = camTarget.clone();
    const toLook = new THREE.Vector3(0, 0, 0);
    const duration = 1200; // ms
    const start = performance.now();
    
    function step(now) {
        const p = Math.min(1, (now - start) / duration);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        
        camera.position.lerpVectors(fromPos, toPos, e);
        camTarget.lerpVectors(fromLook, toLook, e);
        
        // FIX 2: Costringiamo la camera a guardare il nuovo target durante l'animazione
        camera.lookAt(camTarget);

        if (p < 1) {
            requestAnimationFrame(step);
        } else {
            // Assicuriamoci che alla fine dell'animazione i valori siano esattamente quelli di destinazione
            camera.position.copy(toPos);
            camTarget.copy(toLook);
            camera.lookAt(camTarget);

            zooming = false;
            scrollDisabled = false;
            if (done) done();
        }
    }
    requestAnimationFrame(step);
}

// Esponi la funzione globalmente
window.resetToHome = resetToHome;