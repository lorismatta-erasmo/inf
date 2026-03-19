(function(){
    // Sfondo universo 3D usando Three.js
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.THREE) return;

    // evita inserimenti multipli
    if (document.querySelector('.three-bg')) return;

    // Disabilita il 3D pesante su schermi molto piccoli
    const isSmall = window.innerWidth < 600;
    if (isSmall) return;

    const container = document.createElement('div');
    container.className = 'three-bg';
    container.setAttribute('aria-hidden','true');
    const canvas = document.createElement('canvas');
    canvas.id = 'three-canvas';
    container.appendChild(canvas);
    const firstChild = document.body.firstElementChild;
    if (firstChild) document.body.insertBefore(container, firstChild);
    else document.body.appendChild(container);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 0, 1200);

    // luci
    const hemi = new THREE.HemisphereLight(0xffffee, 0x111122, 0.6);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xfff0cc, 0.8);
    dir.position.set(0.5, 1, 0.8);
    scene.add(dir);

    // Stelle (particelle)
    const starsCount = 2400;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++){
        const r = 1200 * Math.pow(Math.random(), 0.8);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;
        // leggera variazione di colore (dorato/bianco)
        const shade = 0.85 + Math.random()*0.3;
        colors[i*3] = shade; colors[i*3+1] = shade; colors[i*3+2] = 0.9 * shade;
    }
    const starsGeom = new THREE.BufferGeometry();
    starsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const starsMat = new THREE.PointsMaterial({ size: 2.2, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false });
    const stars = new THREE.Points(starsGeom, starsMat);
    scene.add(stars);

    // Nebulosa (volumi delicati) — riusa i blob sfocati in CSS per il layering visivo, ma aggiungi una nube di particelle in WebGL
    const cloudsCount = 1;
    // Array dei pianeti
    const planets = [];

    function createPlanet(radius, color, x, y, z){
        const geo = new THREE.SphereGeometry(radius, 32, 24);
        const mat = new THREE.MeshStandardMaterial({ color: color, metalness: 0.3, roughness: 0.6, emissive: 0x0, emissiveIntensity: 0.02 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x,y,z);
        scene.add(mesh);
        return mesh;
    }

    // Crea diversi pianeti posizionati a profondità differenti
    planets.push(createPlanet(120, 0xffc76b, -320, 80, -200)); // pianeta caldo
    planets.push(createPlanet(90, 0xaad8ff, 260, -40, -300)); // pianeta freddo
    const targetPlanet = createPlanet(70, 0xffdf70, 40, 160, -150); // il pianeta "in evidenza"
    planets.push(targetPlanet);

    // anelli sottili per il pianeta in evidenza
    const ringGeo = new THREE.RingGeometry(82, 120, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd6a6, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(targetPlanet.position);
    ring.rotation.x = Math.PI / 2.6;
    scene.add(ring);

    // Piccolo ammasso centrale per suggerire il centro della galassia
    const centerGeom = new THREE.IcosahedronGeometry(32, 0);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0xffd54a, metalness: 0.6, roughness: 0.5, emissive: 0x221100, emissiveIntensity: 0.14 });
    const centerMesh = new THREE.Mesh(centerGeom, centerMat);
    centerMesh.position.set(-80, -40, -50);
    scene.add(centerMesh);

    // gestisci il parallasse del mouse
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e)=>{
        mouseX = (e.clientX - window.innerWidth/2);
        mouseY = (e.clientY - window.innerHeight/2);
    }, {passive:true});

    // Aggiungi lune ai pianeti e una cintura di asteroidi attorno al pianeta caldo
    const moons = [];
    function addMoon(parent, orbitRadius, size, speed, phase){
        const geo = new THREE.SphereGeometry(size, 12, 10);
        const mat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.1, roughness: 0.8 });
        const moon = new THREE.Mesh(geo, mat);
        scene.add(moon);
        moons.push({mesh: moon, parent, orbitRadius, speed, phase});
        return moon;
    }

    // Cintura di asteroidi come piccoli punti attorno al pianeta caldo
    (function createAsteroidBelt(){
        const center = planets[0].position;
        const beltCount = 600;
        const beltPos = new Float32Array(beltCount * 3);
        for (let i=0;i<beltCount;i++){
            const a = Math.random() * Math.PI * 2;
            const r = 160 + Math.random() * 120;
            const x = center.x + Math.cos(a) * r + (Math.random()-0.5)*8;
            const y = center.y + (Math.random()-0.5)*20;
            const z = center.z + Math.sin(a) * r + (Math.random()-0.5)*8;
            beltPos[i*3]=x; beltPos[i*3+1]=y; beltPos[i*3+2]=z;
        }
        const beltGeom = new THREE.BufferGeometry();
        beltGeom.setAttribute('position', new THREE.BufferAttribute(beltPos, 3));
        const beltMat = new THREE.PointsMaterial({ size: 1.6, color: 0xbba36a, transparent: true, opacity: 0.9, depthWrite: false });
        const belt = new THREE.Points(beltGeom, beltMat);
        scene.add(belt);
    })();

    // aggiungi qualche luna
    addMoon(planets[0], 180, 6, 0.6, Math.random());
    addMoon(planets[2], 110, 5, 0.9, Math.random());


    const pageType = document.body && document.body.dataset && document.body.dataset.bg ? document.body.dataset.bg : 'home';

    // stato dell'animazione
    let last = performance.now();
    let t = 0;

    // target della camera per movimenti fluidi
    const camTarget = new THREE.Vector3(0,0,0);

    // flag per disabilitare lo scroll durante le animazioni
    let scrollDisabled = false;

    // funzione per spostare la camera dolcemente (zoom nella pagina about)
    let zooming = false;
    let isZoomedOnPlanet = false;
    let zoomedPlanetIndex = -1;
    function smoothZoomTo(obj, planetIndex, done){
        zooming = true;
        scrollDisabled = true;
        isZoomedOnPlanet = true;
        zoomedPlanetIndex = typeof planetIndex === 'number' ? planetIndex : zoomedPlanetIndex;
        const fromPos = camera.position.clone();
        // leggi l'offset dall'attributo data del body se fornito
        const offsetAttr = document.body && document.body.dataset && document.body.dataset.planetOffset ? parseFloat(document.body.dataset.planetOffset) : NaN;
        const offset = Number.isFinite(offsetAttr) ? offsetAttr : 350;
        const toPos = new THREE.Vector3().copy(obj.position).add(new THREE.Vector3(0,0,offset));
        const fromLook = camTarget.clone();
        const toLook = obj.position.clone();
        let progress = 0;
        const duration = 1600; // ms
        const start = performance.now();
        function step(now){
            const p = Math.min(1, (now - start) / duration);
            // funzione di easing easeInOutCubic
            const e = p<0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;
            camera.position.lerpVectors(fromPos, toPos, e);
            camTarget.lerpVectors(fromLook, toLook, e);
            if (p < 1) requestAnimationFrame(step);
            else { zooming = false; scrollDisabled = false; if (done) done(); }
        }
        requestAnimationFrame(step);
    }

    // funzione per riportare la camera alla vista iniziale/globale
    function resetToHome(done){
        zooming = true;
        scrollDisabled = true;
        isZoomedOnPlanet = false;
        const fromPos = camera.position.clone();
        const toPos = new THREE.Vector3(0, 0, 1200);
        const fromLook = camTarget.clone();
        const toLook = new THREE.Vector3(0,0,0);
        const duration = 1200; // ms
        const start = performance.now();
        function step(now){
            const p = Math.min(1, (now - start) / duration);
            const e = p<0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;
            camera.position.lerpVectors(fromPos, toPos, e);
            camTarget.lerpVectors(fromLook, toLook, e);
            if (p < 1) requestAnimationFrame(step);
            else { zooming = false; scrollDisabled = false; if (done) done(); }
        }
        requestAnimationFrame(step);
    }

    // espone il controllo a window per il pulsante home (accetta callback opzionale)
    window.threeBg = window.threeBg || {};
    window.threeBg.resetView = function(cb){ resetToHome(cb); };
    window.threeBg.zoomToPlanet = function(index, cb){ if (planets[index]) smoothZoomTo(planets[index], index, cb); };
    window.threeBg.isZoomedOnPlanet = function(){ return isZoomedOnPlanet; };
    window.threeBg.leaveZoom = function(){ isZoomedOnPlanet = false; zoomedPlanetIndex = -1; };

    // Nella pagina about, zooma sul pianeta in evidenza subito dopo il caricamento
    if (pageType === 'about'){
        // controlla se veniamo dalla home (così nascondiamo il contenuto e poi facciamo zoom)
        const aboutUrl = new URL(window.location.href);
        const fromQ = aboutUrl.searchParams.get('from');
        if (fromQ === 'home'){
            // assicurati che il contenuto sia nascosto (se non già impostato dallo script in head)
            if (!document.documentElement.classList.contains('preload-hide')) document.documentElement.classList.add('preload-hide');
            // inizia dalla vista home poi zooma sul pianeta, infine mostra il contenuto
            camera.position.set(0,0,1200);
            camTarget.set(0,0,0);
            setTimeout(()=>{ smoothZoomTo(targetPlanet, ()=>{ document.documentElement.classList.remove('preload-hide'); }); }, 300);
        } else {
            // piccolo ritardo per far stabilizzare la scena
            setTimeout(()=>{ smoothZoomTo(targetPlanet); }, 700);
        }
    }
    if (pageType === 'plc'){
        setTimeout(()=>{ smoothZoomTo(planets[0]); }, 700);
    }
    if (pageType === 'smart'){
        setTimeout(()=>{ smoothZoomTo(planets[1]); }, 700);
    }
    if (pageType === 'robot'){
        setTimeout(()=>{ smoothZoomTo(planets[2]); }, 700);
    }

    // Se siamo arrivati in home con parametro from=about, inizia zoomati sul pianeta in evidenza
    const urlParams = new URLSearchParams(window.location.search || '');
    const fromParam = urlParams.get('from');
    if (pageType === 'home' && fromParam === 'about'){
        // posiziona la camera vicino al pianeta in evidenza e poi fai dezoom
        camera.position.copy(targetPlanet.position).add(new THREE.Vector3(0,0,180));
        camTarget.copy(targetPlanet.position);
        // ritarda leggermente poi resetta alla home (dezoom)
        setTimeout(()=>{ resetToHome(); }, 400);
    }
    if (pageType === 'home' && fromParam === 'plc'){
        camera.position.copy(planets[0].position).add(new THREE.Vector3(0,0,180));
        camTarget.copy(planets[0].position);
        setTimeout(()=>{ resetToHome(); }, 400);
    }
    if (pageType === 'home' && fromParam === 'smart'){
        camera.position.copy(planets[1].position).add(new THREE.Vector3(0,0,180));
        camTarget.copy(planets[1].position);
        setTimeout(()=>{ resetToHome(); }, 400);
    }
    if (pageType === 'home' && fromParam === 'robot'){
        camera.position.copy(planets[2].position).add(new THREE.Vector3(0,0,180));
        camTarget.copy(planets[2].position);
        setTimeout(()=>{ resetToHome(); }, 400);
    }

    function animate(now){
        const dt = Math.min(0.05, (now - last) * 0.001);
        last = now;
        t += dt;

        // rotazioni sottili per profondità
        // rotazioni ancora più lente, più cinematografiche
        stars.rotation.y += 0.0015 * dt * 60;
        centerMesh.rotation.y += 0.0025 * dt * 60;
        ring.rotation.z += 0.0002 * dt * 60;
        planets.forEach((p, i)=>{
            p.rotation.y += 0.003 * (0.3 + i*0.04) * dt * 60;
        });

        // aggiorna le lune
        moons.forEach((m)=>{
            m.phase += m.speed * dt;
            const px = m.parent.position.x + Math.cos(m.phase) * m.orbitRadius;
            const pz = m.parent.position.z + Math.sin(m.phase) * m.orbitRadius;
            const py = m.parent.position.y + Math.sin(m.phase * 0.7) * (m.orbitRadius * 0.06);
            m.mesh.position.set(px, py, pz);
            m.mesh.rotation.y += 0.02;
        });

        // parallasse sottile tramite mouse (solo quando non in zoom e non zoomato)
        if (!zooming && !isZoomedOnPlanet) {
            const targetCamX = mouseX * 0.02;
            const targetCamY = -mouseY * 0.02;
            camera.position.x += (targetCamX - camera.position.x) * 0.02;
            camera.position.y += (targetCamY - camera.position.y) * 0.02;
        }

        // smoothing del lookAt della camera
        camera.lookAt(camTarget.x, camTarget.y, camTarget.z);

        // se siamo nella home e non siamo zoomati su un pianeta, orbita lentamente la camera attorno al centro
        // (rimosso per mantenere vista statica)
        // if (pageType === 'home' && !zooming && !isZoomedOnPlanet){
        //     const orbitRadius = 1200;
        //     camera.position.x = Math.cos(t * 0.05) * orbitRadius + (mouseX * 0.02);
        //     camera.position.y = Math.sin(t * 0.03) * 120 + ( -mouseY * 0.02 );
        //     camera.position.z = 1100 + Math.sin(t * 0.02) * 60;
        //     camTarget.set(0,0,0);
        // }

        // fai brillare leggermente le stelle
        const flicker = 0.1 + Math.sin(t*2.0)*0.04;
        stars.material.opacity = 0.9 + flicker*0.1;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    window.addEventListener('resize', ()=>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function setNavActive(index){
        const items = [
            document.getElementById('nav-work'),
            document.getElementById('nav-about'),
            document.getElementById('nav-contact')
        ];
        items.forEach((el, i)=>{
            if (!el) return;
            if (i === index) el.setAttribute('aria-current', 'page');
            else el.removeAttribute('aria-current');
        });
    }

    // Zoom avanti/indietro con lo scroll basato sulla posizione del centro viewport
    const sections = [
        {id: 'work', planet: 0},
        {id: 'about', planet: 1},
        {id: 'contact', planet: 2}
    ];

    // Listener per lo scroll basato sulla posizione
    window.addEventListener('scroll', () => {
        if (scrollDisabled) return;
        
        // Ricalcola le posizioni delle sezioni ad ogni scroll per accuratezza
        const sectionPositions = sections.map(section => {
            const el = document.getElementById(section.id);
            if (el) {
                const rect = el.getBoundingClientRect();
                return {
                    ...section,
                    top: window.scrollY + rect.top,
                    bottom: window.scrollY + rect.bottom
                };
            }
            return null;
        }).filter(Boolean);

        const viewportCenter = window.scrollY + window.innerHeight / 2;
        let current = null;
        for (const pos of sectionPositions) {
            if (viewportCenter >= pos.top && viewportCenter <= pos.bottom) {
                current = pos;
                break;
            }
        }

        if (current && !zooming && current.planet !== zoomedPlanetIndex) {
            // Aggiorniamo la variabile globale che questo file usa per bloccare lo zoom ripetuto
            zoomedPlanetIndex = current.planet; 
            
            window.threeBg.zoomToPlanet(current.planet);
            setNavActive(current.planet);
        }

        // Resetta solo quando si scorre fino in cima
        if (window.scrollY < 50 && isZoomedOnPlanet && !zooming) {
            resetToHome();
            setNavActive(null);
            
            // LA SOLUZIONE È QUI:
            // Diciamo allo scroll che non siamo più su nessun pianeta!
            zoomedPlanetIndex = -1; 
        }
    }, {passive: true});

    // collega il pulsante home se presente: naviga a index con un flag così la home può eseguire un ingresso con dezoom
    const btn = document.getElementById('btn-home');
    if (btn){
        btn.addEventListener('click', (e)=>{
            e.preventDefault();
            // naviga a index segnalando che viene da about così mostra il dezoom
            window.location.href = 'index.html?from=about';
        });
    }
})();
