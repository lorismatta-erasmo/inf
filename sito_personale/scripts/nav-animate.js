(function(){
    // Mappa i link di navigazione ai loro pianeti di destinazione
    const navTargets = {
        'a[href="#work"]': 0,      // Lavori → pianeta 0 (caldo)
        'a[href="#contact"]': 1,   // Contatti → pianeta 1 (freddo)
        'a[href="#about"]': 2      // About → pianeta 2 (in evidenza)
    };

    function attachZoomListeners(){
        Object.entries(navTargets).forEach(([selector, planetIndex]) => {
            const links = document.querySelectorAll(selector);
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Controlla se three-bg è pronto
                    if (window.threeBg && window.threeBg.zoomToPlanet) {
                        e.preventDefault();
                        
                        // Zoom sul pianeta
                        window.threeBg.zoomToPlanet(planetIndex, () => {
                            // Dopo lo zoom, scroll dolce all'ancora
                            const href = link.getAttribute('href');
                            if (href.startsWith('#')) {
                                const target = document.querySelector(href);
                                if (target) target.scrollIntoView({ behavior: 'smooth' });
                            }
                        });
                    }
                });
            });
        });
    }

    // Attendi che il DOM sia pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachZoomListeners);
    } else {
        attachZoomListeners();
    }
})();
