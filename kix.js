document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    var lineRadius = Math.min(canvas.width, canvas.height) / 5;
    // Line center of mass
    var xc = canvas.width / 2;
    var yc = canvas.height / 2;
    // Line angle
    var th = d2r(0);
    // Line translational and rotational velocity
    var vx = -2;
    var vy = 1;
    var vr = -0.003;
    // Computed line properties
    var x0 = 0, y0 = 0, x1 = 0, y1 = 0;
    var vx0 = 0, vy0 = 0, vx1 = 0, vy1 = 0;
    var prevLines = [];
    var tick = 0;
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
    var bounces = 0;
    function bounceX0() {
        ++bounces;
        var sin = Math.sin(th);
        var dvx = -2 * (vx + vr * lineRadius * sin) / (1 + sin * sin);
        var dvr = sin * dvx / lineRadius;
        vx += dvx;
        vr += dvr;
        x0 = Math.max(0, Math.min(x0, canvas.width - 1));
    }
    function bounceX1() {
        ++bounces;
        var sin = Math.sin(th);
        var dvx = -2 * (vx - vr * lineRadius * sin) / (1 + sin * sin);
        var dvr = -sin * dvx / lineRadius;
        vx += dvx;
        vr += dvr;
        x1 = Math.max(0, Math.min(x1, canvas.width - 1));
    }
    function bounceY0() {
        ++bounces;
        var cos = -Math.cos(th);
        var dvy = -2 * (vy + vr * lineRadius * cos) / (1 + cos * cos);
        var dvr = cos * dvy / lineRadius;
        vy += dvy;
        vr += dvr;
        y0 = Math.max(0, Math.min(y0, canvas.height - 1));
    }
    function bounceY1() {
        ++bounces;
        var cos = -Math.cos(th);
        var dvy = -2 * (vy - vr * lineRadius * cos) / (1 + cos * cos);
        var dvr = -cos * dvy / lineRadius;
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
            ctx.fillText("x: ".concat(xc.toFixed(2), ", y: ").concat(yc.toFixed(2), ", \u03B8: ").concat(r2d(th).toFixed(2)), 10, 20);
            ctx.fillText("vx: ".concat(vx.toFixed(2), ", vy: ").concat(vy.toFixed(2), ", v\u03B8: ").concat(r2d(vr).toFixed(2)), 10, 40);
            ctx.fillStyle = "red";
            ctx.fillText("vx0: ".concat(vx0.toFixed(2), ", vy0: ").concat(vy0.toFixed(2)), 10, 60);
            ctx.fillStyle = "green";
            ctx.fillText("vx1: ".concat(vx1.toFixed(2), ", vy1: ").concat(vy1.toFixed(2)), 10, 80);
            // Kinetic energy of two point masses (m=1) moving at (vxi, vyi).
            var E = 0.5 * (vx0 * vx0 + vy0 * vy0 + vx1 * vx1 + vy1 * vy1);
            // Kinetic energy of mass (M=2) moving at (vx, vy) plus rotational energy.
            // Showing both helps check that our simulation makes any sense.
            var E2 = vx * vx + vy * vy + (vr * lineRadius) * (vr * lineRadius);
            ctx.fillStyle = "cornflower";
            ctx.fillText("E: ".concat(E.toFixed(2), " | ").concat(E2.toFixed(2)), 10, 100);
        }
        ctx.lineWidth = 2;
        var lim = 40;
        for (var i = 40; i >= 0; i -= 8) {
            if (i >= prevLines.length)
                continue;
            if (i != 0 && !showTrail)
                continue;
            var _a = prevLines[i], x0_1 = _a[0], y0_1 = _a[1], x1_1 = _a[2], y1_1 = _a[3];
            ctx.strokeStyle = "hsl(".concat(360 * i / (lim + 1), "deg, 50%, ").concat(50 + 50 * (lim - i) / lim, "%)");
            ctx.beginPath();
            ctx.moveTo(x0_1, y0_1);
            ctx.lineTo(x1_1, y1_1);
            ctx.stroke();
        }
        drawCircle(x0, y0, 'red');
        drawCircle(x1, y1, 'green');
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
        var step = 5;
        for (var t = 0; t < canvas.height; t += step) {
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
    function drawCircle(x, y, fillStyle) {
        if (fillStyle === void 0) { fillStyle = 'white'; }
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI); // x, y is the center and 3 is the radius
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.closePath();
    }
    var vectorScale = 50;
    function drawVector(x0, y0, vx, vy, strokeStyle) {
        if (strokeStyle === void 0) { strokeStyle = 'grey'; }
        var x1 = x0 + vectorScale * vx;
        var y1 = y0 + vectorScale * vy;
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        // Determine the angle
        var angle = Math.atan2(y1 - y0, x1 - x0);
        // Length and width for the arrowhead
        var length = 10; // or any desired length
        var width = 5; // or any desired width
        // Calculate points for the arrowhead
        var x2 = x1 - length * Math.cos(angle - Math.PI / 6);
        var y2 = y1 - length * Math.sin(angle - Math.PI / 6);
        var x3 = x1 - length * Math.cos(angle + Math.PI / 6);
        var y3 = y1 - length * Math.sin(angle + Math.PI / 6);
        // Draw arrowhead
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x3, y3);
        ctx.stroke();
    }
    // Example usage:
    var x = 50; // Example x-coordinate
    var y = 50; // Example y-coordinate
    drawCircle(x, y);
    draw();
    window.addEventListener("resize", function () {
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
        draw();
    });
});
function r2d(radians) {
    return radians * (180 / Math.PI);
}
function d2r(degrees) {
    return degrees * (Math.PI / 180);
}
var showVectors = false;
var showQuantities = false;
var showTrail = false;
document.addEventListener('keydown', function (event) {
    if (event.key === 'v' || event.key === 'V') {
        showVectors = !showVectors;
    }
});
document.addEventListener('keydown', function (event) {
    if (event.key === 'q' || event.key === 'Q') {
        showQuantities = !showQuantities;
    }
});
document.addEventListener('keydown', function (event) {
    if (event.key === 't' || event.key === 'T') {
        showTrail = !showTrail;
    }
});
