var rows;
var cols;
var sclx;
var scly;

var xBase;
var yBase;
var xInce;
var yInce;

var thm; // terrain height map

window.windowResized = function() {
	resizeCanvas(windowWidth, windowHeight);
}

window.preload = function() {
	
}

window.setup = function() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	frameRate(60);

    rows = 50;
    cols = 50;

    sclx = Math.floor(windowWidth / rows);
    scly = Math.floor(windowHeight / cols);

    xBase = Math.random() * 1000;
    yBase = Math.random() * 1000;
    xInce = 1e-1;
    yInce = 1e-1;

    thm = Array.from({length: rows + 1}, x => new Array(cols + 1).fill(0));
}

window.draw = frameRender;

function framePhysic() {
    updateTerrain();
}

function frameRender() {
    framePhysic();

    background(0, 0, 0);
    
    displayTerrain();
}

function updateTerrain() {
    let xOff = xBase;
    let yOff = yBase;
    for (let yr = 0; yr <= rows; yr++) {
        xOff = xBase;
        for (let xc = 0; xc <= cols; xc++) {
            thm[yr][xc] = map(noise(xOff, yOff), 0, 1, -200, +200);
            xOff += xInce;
        }
        yOff += xInce;
    }
    xBase += deltaTime * 1e-4;
    yBase += deltaTime * 1e-4;
}

function displayTerrain() { 
    noFill();
    stroke(255);

    rotateX(PI / 3.0);
    translate(-windowWidth/2, -windowHeight/2);

    let xOff = xBase;
    let yOff = yBase;

    for (let yr = 0; yr <= rows - 1; yr++) {
        xOff = xBase;
        beginShape(TRIANGLE_STRIP); // 设置图元
        for (let xc = 0; xc <= cols; xc++) {
            // rect(xc * sclx, yr * scly, sclx, scly);
            vertex(xc * sclx, yr * scly, thm[yr][xc]);
            vertex(xc * sclx, (yr + 1) * scly, thm[yr + 1][xc]);

            xOff += xInce;
        }
        endShape();
        yOff += xInce;
    }

    // xBase += deltaTime * 1e-4;
    yBase -= deltaTime * 1e-3;
}
