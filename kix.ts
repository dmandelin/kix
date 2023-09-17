document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    canvas.addEventListener('touchstart', () => {
        showTrail = !showTrail;
    });

    const lineRadius = Math.min(canvas.width, canvas.height) / 5;

    // Line center of mass
    let xc = canvas.width / 2;
    let yc = canvas.height / 2;
    // Line angle
    let th = d2r(0);

    // Line translational and rotational velocity
    let vx = -2;
    let vy = 1;
    let vr = -0.003;

    // Computed line properties
    let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
    let vx0 = 0, vy0 = 0, vx1 = 0, vy1 = 0;

    const prevLines: [number, number, number, number][] = [];

    let tick = 0;

    function update() {
        xc += vx;
        yc += vy;
        th += vr;
        if (th >= 2 * Math.PI) {
            th -= 2 * Math.PI;
        }

        x0 = xc - Math.cos(th) * lineRadius;
        y0 = yc - Math.sin(th) * lineRadius;
        x1 = xc + Math.cos(th) * lineRadius;
        y1 = yc + Math.sin(th) * lineRadius;

        vx0 = vx + Math.sin(th) * lineRadius * vr;
        vy0 = vy - Math.cos(th) * lineRadius * vr;
        vx1 = vx - Math.sin(th) * lineRadius * vr;
        vy1 = vy + Math.cos(th) * lineRadius * vr;

        if (x0 < 0 || x0 >= canvas.width) {
            bounceX0();
        }
        if (x1 < 0 || x1 >= canvas.width) {
            bounceX1();
        }
        if (y0 < 0 || y0 >= canvas.height) {
            bounceY0();
        }
        if (y1 < 0 || y1 >= canvas.height) {
            bounceY1();
        }

        if (prevLines.length > 41) {
            prevLines.pop();
        }
        prevLines.unshift([x0, y0, x1, y1]);
    }

    let bounces = 0;

    function bounceX0() {
        ++bounces;

        const sin = Math.sin(th);
        const dvx = -2 * (vx + vr * lineRadius * sin) / (1 + sin*sin);
        const dvr = sin * dvx / lineRadius;
        vx += dvx;
        vr += dvr;
        x0 = Math.max(0, Math.min(x0, canvas.width - 1));
    }

    function bounceX1() {
        ++bounces;

        const sin = Math.sin(th);
        const dvx = -2 * (vx - vr * lineRadius * sin) / (1 + sin*sin);
        const dvr = -sin * dvx / lineRadius;
        vx += dvx;
        vr += dvr;
        x1 = Math.max(0, Math.min(x1, canvas.width - 1));
    }

    function bounceY0() {
        ++bounces;

        const cos = -Math.cos(th);
        const dvy = -2 * (vy + vr * lineRadius * cos) / (1 + cos*cos);
        const dvr = cos * dvy / lineRadius;
        vy += dvy;
        vr += dvr;
        y0 = Math.max(0, Math.min(y0, canvas.height - 1));
    }

    function bounceY1() {
        ++bounces;

        const cos = -Math.cos(th);
        const dvy = -2 * (vy - vr * lineRadius * cos) / (1 + cos*cos);
        const dvr = -cos * dvy / lineRadius;
        vy += dvy;
        vr += dvr;
        y1 = Math.max(0, Math.min(y1, canvas.height - 1));
    }

    function draw() {
        update();

        drawBackground();

        if (showQuantities) {
            ctx.font = "16px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(`x: ${xc.toFixed(2)}, y: ${yc.toFixed(2)}, θ: ${r2d(th).toFixed(2)}`, 10, 20);
            ctx.fillText(`vx: ${vx.toFixed(2)}, vy: ${vy.toFixed(2)}, vθ: ${r2d(vr).toFixed(2)}`, 10, 40);
            ctx.fillStyle = "red";
            ctx.fillText(`vx0: ${vx0.toFixed(2)}, vy0: ${vy0.toFixed(2)}`, 10, 60);
            ctx.fillStyle = "green";
            ctx.fillText(`vx1: ${vx1.toFixed(2)}, vy1: ${vy1.toFixed(2)}`, 10, 80);

            // Kinetic energy of two point masses (m=1) moving at (vxi, vyi).
            const E = 0.5*(vx0*vx0 + vy0*vy0 + vx1*vx1 + vy1*vy1);
            // Kinetic energy of mass (M=2) moving at (vx, vy) plus rotational energy.
            // Showing both helps check that our simulation makes any sense.
            const E2 = vx*vx + vy*vy + (vr*lineRadius)*(vr*lineRadius);
            ctx.fillStyle = "cornflower";
            ctx.fillText(`E: ${E.toFixed(2)} | ${E2.toFixed(2)}`, 10, 100);
        }

        ctx.lineWidth = 2;

        const lim = 40;
        for (let i = 40; i >= 0; i -= 8) {
            if (i >= prevLines.length) continue;
            if (i != 0 && !showTrail) continue;
            const [x0, y0, x1, y1] = prevLines[i];
            ctx.strokeStyle = `hsl(${360*i/(lim+1)}deg, 50%, ${50 + 50*(lim-i)/lim}%)`;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        }

        if (showQuantities || showVectors) {
            drawCircle(x0, y0, 'red');
            drawCircle(x1, y1, 'green');
        }

        if (showVectors) {
            drawVector(xc, yc, vx, vy);
            drawVector(x0, y0, vx0, vy0, 'pink');
            drawVector(x1, y1, vx1, vy1, 'light green');
        }
        
        requestAnimationFrame(draw);
    }

    function draw2() {
        drawBackground();

        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;

        const step = 5;
        for (let t = 0; t < canvas.height; t += step) {
            ctx.beginPath();
            ctx.moveTo(t, 0);
            ctx.lineTo(0, canvas.height - t);
            ctx.stroke();
        } 
    }

    function drawBackground() {
        // Fill the canvas with black
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawCircle(x: number, y: number, fillStyle: string = 'white'): void {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);  // x, y is the center and 3 is the radius
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.closePath();
    }

    const vectorScale = 50;

    function drawVector(x0: number, y0: number, vx: number, vy: number, strokeStyle: string = 'grey') {
        const x1 = x0 + vectorScale * vx;
        const y1 = y0 + vectorScale * vy;
        ctx.strokeStyle = strokeStyle;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        
        // Determine the angle
        let angle = Math.atan2(y1 - y0, x1 - x0);
    
        // Length and width for the arrowhead
        let length = 10;  // or any desired length
        let width = 5;    // or any desired width
    
        // Calculate points for the arrowhead
        let x2 = x1 - length * Math.cos(angle - Math.PI / 6); 
        let y2 = y1 - length * Math.sin(angle - Math.PI / 6);
        
        let x3 = x1 - length * Math.cos(angle + Math.PI / 6);
        let y3 = y1 - length * Math.sin(angle + Math.PI / 6);
    
        // Draw arrowhead
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x3, y3);
        ctx.stroke();
    }
    
    // Example usage:
    const x = 50;  // Example x-coordinate
    const y = 50;  // Example y-coordinate
    drawCircle(x, y);
    
    draw();

    window.addEventListener("resize", function() {
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
        draw();
    });
});

function r2d(radians: number): number {
    return radians * (180 / Math.PI);
}

function d2r(degrees: number): number {
    return degrees * (Math.PI / 180);
}

let showVectors = false;
let showQuantities = false;
let showTrail = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'v' || event.key === 'V') {
        showVectors = !showVectors;
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'q' || event.key === 'Q') {
        showQuantities = !showQuantities;
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 't' || event.key === 'T') {
        showTrail = !showTrail;
    }
});
