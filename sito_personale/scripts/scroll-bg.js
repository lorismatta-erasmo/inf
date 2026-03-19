(function(){
    // Aggiorna la variabile CSS --bg-h in base al progresso dello scroll
    const docEl = document.documentElement;
    let ticking = false;

    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

    function onScroll(){
        if (!ticking){
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY || window.pageYOffset;
                const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
                const winH = window.innerHeight;
                const maxScroll = Math.max(1, docHeight - winH);
                const progress = clamp(scrollY / maxScroll, 0, 1);

                // Interpola hue da 220 (blu scuro) a 40 (oro caldo)
                const startHue = 220;
                const endHue = 40;
                const hue = Math.round(startHue + (endHue - startHue) * progress);

                // Opzionale: piccola variazione sulla luminosità per dare più "respiro"
                const startL = 6; // percentuale senza %
                const endL = 14;
                const lightness = Math.round(startL + (endL - startL) * progress);

                docEl.style.setProperty('--bg-h', String(hue));
                docEl.style.setProperty('--bg-h2', String(hue + 30));
                docEl.style.setProperty('--bg-l', String(lightness) + '%');
                docEl.style.setProperty('--bg-l2', Math.min(40, lightness + 8) + '%');

                ticking = false;
            });
            ticking = true;
        }
    }

    // Inizializza posizione (utile su load con anchor)
    function init(){
        onScroll();
    }

    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', init);
})();
