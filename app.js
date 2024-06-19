document.getElementById('upload').addEventListener('change', loadImage);
document.getElementById('save').addEventListener('click', saveImage);
document.getElementById('upscale').addEventListener('click', upscaleImage);
document.getElementById('undo').addEventListener('click', undo);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();

let textBlocks = [];
let activeTextIndex = null;
let isDragging = false;
let history = [];

function loadImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            saveState();
            draw();
        }
    }
    reader.readAsDataURL(file);
}

function saveImage() {
    const format = document.getElementById('file-format').value;
    const link = document.createElement('a');
    link.download = `edited-image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
}

function applyFilter(filter) {
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        switch (filter) {
            case 'grayscale':
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
                break;
            case 'sepia':
                data[i] = data[i] * 0.393 + data[i + 1] * 0.769 + data[i + 2] * 0.189;
                data[i + 1] = data[i] * 0.349 + data[i + 1] * 0.686 + data[i + 2] * 0.168;
                data[i + 2] = data[i] * 0.272 + data[i + 1] * 0.534 + data[i + 2] * 0.131;
                break;
            case 'invert':
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
                break;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    drawTextBlocks();
}

document.getElementById('brightness').addEventListener('input', applyAdjustments);
document.getElementById('contrast').addEventListener('input', applyAdjustments);

function applyAdjustments() {
    ctx.drawImage(img, 0, 0);
    const brightness = parseInt(document.getElementById('brightness').value);
    const contrast = parseInt(document.getElementById('contrast').value);

    ctx.filter = `brightness(${brightness + 100}%) contrast(${contrast + 100}%)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = 'none';
    drawTextBlocks();
}

document.getElementById('text-input').addEventListener('input', updateActiveText);
document.getElementById('font-size').addEventListener('input', updateActiveText);
document.getElementById('font-family').addEventListener('input', updateActiveText);
document.getElementById('font-color').addEventListener('input', updateActiveText);

canvas.addEventListener('mousedown', startDragging);
canvas.addEventListener('mousemove', drag);
canvas.addEventListener('mouseup', stopDragging);
canvas.addEventListener('mouseout', stopDragging);

function startDragging(event) {
    const { offsetX, offsetY } = event;
    activeTextIndex = getActiveTextIndex(offsetX, offsetY);

    if (activeTextIndex !== null) {
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    }
}

function drag(event) {
    if (isDragging && activeTextIndex !== null) {
        textBlocks[activeTextIndex].x = event.offsetX;
        textBlocks[activeTextIndex].y = event.offsetY;
        draw();
    }
}

function stopDragging() {
    isDragging = false;
    canvas.style.cursor = 'move';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    applyAdjustments(); // Reapply adjustments if any
    drawTextBlocks();
}

function drawTextBlocks() {
    textBlocks.forEach((textBlock, index) => {
        ctx.font = `${textBlock.size}px ${textBlock.font}`;
        ctx.fillStyle = textBlock.color;
        ctx.fillText(textBlock.text, textBlock.x, textBlock.y);

        if (index === activeTextIndex) {
            drawTextOutline(textBlock);
        }
    });
}

function drawTextOutline(textBlock) {
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 2;
    const textWidth = ctx.measureText(textBlock.text).width;
    const textHeight = parseInt(textBlock.size, 10); // Rough estimate of text height
    ctx.strokeRect(textBlock.x, textBlock.y - textHeight, textWidth, textHeight);
}

function addText() {
    const text = document.getElementById('text-input').value;
    const size = parseInt(document.getElementById('font-size').value);
    const font = document.getElementById('font-family').value;
    const color = document.getElementById('font-color').value;

    textBlocks.push({ text, size, font, color, x: 50, y: 50 });
    saveState();
    draw();
}

function updateActiveText() {
    if (activeTextIndex !== null) {
        const text = document.getElementById('text-input').value;
        const size = parseInt(document.getElementById('font-size').value);
        const font = document.getElementById('font-family').value;
        const color = document.getElementById('font-color').value;

        const activeText = textBlocks[activeTextIndex];
        activeText.text = text;
        activeText.size = size;
        activeText.font = font;
        activeText.color = color;

        saveState();
        draw();
    }
}

function getActiveTextIndex(x, y) {
    for (let i = textBlocks.length - 1; i >= 0; i--) {
        const textBlock = textBlocks[i];
        ctx.font = `${textBlock.size}px ${textBlock.font}`;
        const textWidth = ctx.measureText(textBlock.text).width;
        const textHeight = parseInt(ctx.font, 10); // Rough estimate of text height

        if (x >= textBlock.x && x <= textBlock.x + textWidth &&
            y >= textBlock.y - textHeight && y <= textBlock.y) {
            setActiveTextInputs(textBlock);
            return i;
        }
    }
    return null;
}

function setActiveTextInputs(textBlock) {
    document.getElementById('text-input').value = textBlock.text;
    document.getElementById('font-size').value = textBlock.size;
    document.getElementById('font-family').value = textBlock.font;
    document.getElementById('font-color').value = textBlock.color;
}

function upscaleImage() {
    const scale = prompt("Enter upscale factor (e.g., 2 for 2x, 4 for 4x):", "2");
    const factor = parseInt(scale);

    if (factor && factor > 0) {
        const newWidth = img.width * factor;
        const newHeight = img.height * factor;

        if (newWidth <= 3840 && newHeight <= 2160) { // 4K resolution
            const offscreenCanvas = document.createElement('canvas');
            const offscreenCtx = offscreenCanvas.getContext('2d');
            offscreenCanvas.width = newWidth;
            offscreenCanvas.height = newHeight;

            offscreenCtx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.width = newWidth;
            canvas.height = newHeight;
            img = new Image();
            img.src = offscreenCanvas.toDataURL();
            img.onload = () => {
                saveState();
                draw();
            };
        } else {
            alert("Upscaled image exceeds 4K resolution.");
        }
    } else {
        alert("Invalid upscale factor.");
    }
}

function saveState() {
    const state = {
        imgSrc: canvas.toDataURL(),
        textBlocks: JSON.parse(JSON.stringify(textBlocks))
    };
    history.push(state);
}

function undo() {
    if (history.length > 1) {
        history.pop();
        const lastState = history[history.length - 1];
        const img = new Image();
        img.src = lastState.imgSrc;
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            textBlocks = JSON.parse(JSON.stringify(lastState.textBlocks));
            draw();
        }
    }
}