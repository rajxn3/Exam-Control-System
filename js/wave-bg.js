/**
 * Wireframe Wave Background Engine
 * Renders an animated clean white background with subtle gray rippling line-waves.
 * Attach to any page that has: <canvas id="flowerCanvas"></canvas>
 */
(function () {
    'use strict';

    const canvas = document.getElementById('flowerCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, t = 0;

    /* ── Wave band configs ── */
    const BANDS = [
        /* yBase: fraction of height where band centre sits */
        /* lines: how many parallel lines per band          */
        /* amp: vertical amplitude as fraction of H        */
        { yBase: 0.52, amp: 0.11, freq: 1.3, speed: 0.008, lines: 28, spread: 0.045, color: 'rgba(150,150,155,{a})', alphaMax: 0.35 },
        { yBase: 0.60, amp: 0.09, freq: 1.7, speed: 0.010, lines: 20, spread: 0.034, color: 'rgba(160,160,165,{a})', alphaMax: 0.25 },
        { yBase: 0.44, amp: 0.08, freq: 1.1, speed: 0.006, lines: 16, spread: 0.028, color: 'rgba(140,140,145,{a})', alphaMax: 0.20 },
        { yBase: 0.68, amp: 0.07, freq: 2.0, speed: 0.012, lines: 14, spread: 0.022, color: 'rgba(170,170,175,{a})', alphaMax: 0.18 },
    ];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    /* Pure white background */
    function drawBg() {
        ctx.save();
        /* Slightly warmer-white radial fill for depth */
        const rg = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
        rg.addColorStop(0.00, '#ffffff');
        rg.addColorStop(0.55, '#f9fafb');
        rg.addColorStop(1.00, '#f0f0f3');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
    }

    /* Compute y of a single wave line at position x */
    function waveY(band, lineIdx, x) {
        const nx = x / W;
        const lineOffset = (lineIdx - band.lines / 2) * band.spread * H;
        return (
            band.yBase * H
            + lineOffset
            + band.amp * H * Math.sin(nx * Math.PI * 2 * band.freq + t * band.speed * 60 + lineIdx * 0.18)
            + band.amp * H * 0.30 * Math.sin(nx * Math.PI * 2 * band.freq * 2.1 - t * band.speed * 40 + lineIdx * 0.35)
            + band.amp * H * 0.12 * Math.sin(nx * Math.PI * 2 * band.freq * 3.7 + t * band.speed * 80)
        );
    }

    function drawBand(band) {
        const steps = Math.ceil(W / 3);

        for (let li = 0; li < band.lines; li++) {
            /* Alpha tapers at the edges of the bundle */
            const frac = li / (band.lines - 1);         // 0..1
            const taper = Math.sin(frac * Math.PI);     // peaks at mid-bundle
            const alpha = (band.alphaMax * taper * (0.55 + 0.45 * Math.sin(t * 0.4 + li * 0.22))).toFixed(3);
            const strokeColor = band.color.replace('{a}', alpha);

            ctx.save();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 0.8;
            ctx.beginPath();

            for (let i = 0; i <= steps; i++) {
                const x = (i / steps) * W;
                const y = waveY(band, li, x);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    /* Subtle shaded fill between outermost lines of each band for depth */
    function drawBandFill(band) {
        const steps = Math.ceil(W / 4);

        ctx.save();
        ctx.beginPath();
        /* Top edge */
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * W;
            const y = waveY(band, 0, x);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        /* Bottom edge (reverse) */
        for (let i = steps; i >= 0; i--) {
            const x = (i / steps) * W;
            const y = waveY(band, band.lines - 1, x);
            ctx.lineTo(x, y);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, band.yBase * H - band.amp * H, 0, band.yBase * H + band.amp * H);
        grad.addColorStop(0, 'rgba(200,200,210,0.00)');
        grad.addColorStop(0.5, 'rgba(180,180,195,0.06)');
        grad.addColorStop(1, 'rgba(200,200,210,0.00)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }

    function draw() {
        t += 0.012;
        ctx.clearRect(0, 0, W, H);
        drawBg();

        /* Draw fills first (subtle), then lines on top */
        BANDS.forEach(drawBandFill);
        BANDS.forEach(drawBand);

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
})();
