// noinspection PointlessArithmeticExpressionJS

const TWO_PI = 2 * Math.PI;
const MM_PER_INCH = 25.4;
const V_OFFS = 1.0;
const CIR_RADIUS = MM_PER_INCH;
const CIR_X_ORIG = 3 * CIR_RADIUS;
const PIX_PER = 15;

/**
 * Convert a canvas element to high-DPI mode (if supported by device).
 *
 * @param canvas {HTMLCanvasElement} canvas element to convert
 * @return {CanvasRenderingContext2D}
 */
function convertCanvasHiDPI(canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });
    const ratio = window.devicePixelRatio || 1;
    // noinspection JSUndefinedPropertyAssignment
    canvas._ratio = ratio;
    const w = canvas.width;
    const h = canvas.height;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(ratio, ratio);
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    return ctx;
}

/**
 * Convert coordinates from the number line context to the canvas context.
 * @param ctx {CanvasRenderingContext2D} canvas context
 * @param x {Number} x-coordinate (in mm) relative to number line
 * @param y {Number} y-coordinate (in mm) relative to number line
 */
function coords(ctx, x, y) {
    // noinspection JSUnresolvedVariable
    const ratio = ctx.canvas._ratio || 1;
    const pixelsPerMm = PIX_PER / ratio;
    let cx = ctx.canvas.width / ratio / 2 + y * pixelsPerMm;
    let cy = 10 * PIX_PER / ratio + x * pixelsPerMm;
    return [cx, cy];
}

/**
 * @param ctx {CanvasRenderingContext2D}
 * @param x {Number} x-coordinate (in mm) of arc center, relative to number line
 * @param y {Number} y-coordinate (in mm) of arc center, relative to number line
 * @param radius {Number} radius in mm
 * @param arcStart {Number} start of arc in degrees
 * @param arcEnd {Number} end of arc in degrees
 */
function arc(ctx, x, y, radius, arcStart, arcEnd) {
    const [cx, cy] = coords(ctx, x, y);
    // noinspection JSUnresolvedVariable
    const ratio = ctx.canvas._ratio || 1;
    const pixelsPerMm = PIX_PER / ratio;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * pixelsPerMm,
        (arcStart - 90) * Math.PI / 180, (arcEnd - 90) * Math.PI / 180);
    ctx.stroke();
}

/**
 * Draw the tattoo.
 */
function draw() {
    const canvas = document.getElementById('cvs');
    const ctx = convertCanvasHiDPI(canvas);
    drawGuides(ctx);
    drawArcs(ctx);
    drawArcResults(ctx);
    drawZeroLine(ctx);
    drawCentimeters(ctx);
    drawInches(ctx);
}

function drawGuides(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.setLineDash([1, 1]);
    ctx.moveTo(...coords(ctx, -15, -40));
    ctx.lineTo(...coords(ctx, -15, 40));
    ctx.lineTo(...coords(ctx, 165, 40));
    ctx.lineTo(...coords(ctx, 165, -40));
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

/**
 * @param ctx {CanvasRenderingContext2D}
 */
function drawArcs(ctx) {
    ctx.save();
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 1.5;
    const [ox, oy] = [CIR_X_ORIG, 0];
    arc(ctx, ox, oy, CIR_RADIUS, 0, 180);
    ctx.lineWidth = 1;
    // 90deg
    arc(ctx, CIR_X_ORIG - CIR_RADIUS, 0, CIR_RADIUS * 1.2, 135, 155);
    arc(ctx, CIR_X_ORIG + CIR_RADIUS, 0, CIR_RADIUS * 1.2, 20, 43);

    // 45deg
    arc(ctx, CIR_X_ORIG - CIR_RADIUS, 0, CIR_RADIUS * 0.9, 90, 105);
    arc(ctx, CIR_X_ORIG, CIR_RADIUS, CIR_RADIUS * 0.9, -18, 5);

    // 20deg
    const r1 = 0.55 * CIR_RADIUS;
    arc(ctx, ox - 0*r1, oy, r1, -2, 11);
    arc(ctx, ox - 1*r1, oy, r1, -2, 11);
    arc(ctx, ox - 2*r1, oy, r1, -2, 11);
    arc(ctx, ox - 2*r1, oy, r1, 50, 68);
    arc(ctx, ox - 3*r1, oy, r1, 120, 130);

    // 60deg
    arc(ctx, ox + CIR_RADIUS, oy, CIR_RADIUS, 55, 66);

    // 30deg
    const [ox1, oy1] = [ox + CIR_RADIUS/2, oy + CIR_RADIUS * Math.sqrt(3)/2];
    arc(ctx, ox + CIR_RADIUS, oy, CIR_RADIUS, 110, 130);
    arc(ctx, ox1, oy1, CIR_RADIUS, 165, 190);

    // 15deg
    const [ox2, oy2] = [ox + CIR_RADIUS * Math.sqrt(3)/2, oy + CIR_RADIUS/2];
    arc(ctx, ox + CIR_RADIUS, oy, CIR_RADIUS/2, 123, 155);
    arc(ctx, ox2, oy2, CIR_RADIUS/2, 180, 210);

    ctx.restore();
}

/**
 * @param ctx {CanvasRenderingContext2D}
 */
function drawArcResults(ctx) {
    const [ox, oy] = [CIR_X_ORIG, 0];
    function drawRay(deg, len) {
        ctx.beginPath();
        ctx.moveTo(...coords(ctx, ox, oy));
        const xDist = Math.cos(deg * TWO_PI / 360) * CIR_RADIUS * len;
        const yDist = Math.sin(deg * TWO_PI / 360) * CIR_RADIUS * len;
        ctx.lineTo(...coords(ctx, ox + xDist, oy + yDist));
        ctx.stroke();
    }
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 1.5;
    drawRay(90, 1.2);
    drawRay(180 - 45, 1.4);
    drawRay(180 - 19.25, 2.2);
    drawRay(60, 1.3);
    drawRay(30, 2.3);
    drawRay(15, 2.8);
    ctx.restore();
}

/**
 * @param ctx {CanvasRenderingContext2D}
 * @param x {Number}
 * @param y {Number}
 * @param radius {Number?}
 */
function drawDot(ctx, x, y, radius) {
    radius = radius || 1;
    ctx.save();
    ctx.beginPath();
    let [cx, cy] = coords(ctx, x, y);
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();
}

/**
 * @param ctx {CanvasRenderingContext2D}
 */
function drawCentimeters(ctx) {
    const markHeight = 1;
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'black';
    for (let i = 0; i <= 150; i += 10) {
        if (i === 555 || i === 100) {
            continue;
        }
        ctx.beginPath();
        ctx.moveTo(...coords(ctx, i, -V_OFFS));
        ctx.lineTo(...coords(ctx, i, -V_OFFS - markHeight));
        ctx.stroke();
    }
    const vSize = 0.7;
    ctx.beginPath();
    ctx.moveTo(...coords(ctx, 50 - vSize, -V_OFFS - 0.3 + vSize));
    ctx.lineTo(...coords(ctx, 50, -V_OFFS - 0.3 - vSize));
    ctx.lineTo(...coords(ctx, 50 + vSize, -V_OFFS - 0.3 + vSize));
    ctx.stroke();
    const xSize = 0.7;
    ctx.beginPath();
    ctx.moveTo(...coords(ctx, 100 - xSize, -V_OFFS - 0.8 + xSize));
    ctx.lineTo(...coords(ctx, 100 + xSize, -V_OFFS - 0.8 - xSize));
    ctx.moveTo(...coords(ctx, 100 + xSize, -V_OFFS - 0.8 + xSize));
    ctx.lineTo(...coords(ctx, 100 - xSize, -V_OFFS - 0.8 - xSize));
    ctx.stroke();

    ctx.restore();
}

/**
 * @param ctx {CanvasRenderingContext2D}
 */
function drawInches(ctx) {
    const markHeight = 0.8;
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'black';
    for (let i = 0; i <= 6; i += 1) {
        if (i === 555 || i === 3) {
            continue;
        }
        ctx.beginPath();
        ctx.moveTo(...coords(ctx, i * MM_PER_INCH, V_OFFS));
        const h = (i === 1 || i === 0) ? 2 * markHeight : markHeight;
        ctx.lineTo(...coords(ctx, i * MM_PER_INCH, V_OFFS + h));
        ctx.stroke();
    }
    let fractions = [2, 4, 8, 16];
    fractions.forEach(i => {
        ctx.beginPath();
        ctx.moveTo(...coords(ctx, MM_PER_INCH / i, V_OFFS));
        ctx.lineTo(...coords(ctx, MM_PER_INCH / i, V_OFFS + markHeight * 0.8));
        ctx.stroke();
    });

    const vSize = 0.7;
    ctx.beginPath();
    ctx.moveTo(...coords(ctx, 5 * MM_PER_INCH - vSize, V_OFFS + 0.8 + vSize));
    ctx.lineTo(...coords(ctx, 5 * MM_PER_INCH, V_OFFS + 0.8 - vSize));
    ctx.lineTo(...coords(ctx, 5 * MM_PER_INCH + vSize, V_OFFS + 0.8 + vSize));
    ctx.stroke();

    ctx.restore();
}

/**
 * @param ctx {CanvasRenderingContext2D}
 */
function drawZeroLine(ctx) {
    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 150; i++) {
        drawDot(ctx, i, 0, 0.3);
    }
    ctx.beginPath();
    ctx.arc(...coords(ctx, -2.2, 0), ctx.canvas._ratio * 2, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();
}

window.addEventListener('load', draw);