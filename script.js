var quill = new Quill('#editor-container', {
    modules: {
        toolbar: '#toolbar-container'
    },
    theme: 'snow'
});

document.getElementById('add-text').onclick = function() {
    quill.focus();
};

document.getElementById('undo').onclick = function() {
    quill.history.undo();
};

document.getElementById('redo').onclick = function() {
    quill.history.redo();
};

let draggedText = '';
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let currentTextElement = null;

function saveState() {
    quill.history.stack.undo.push({
        type: 'custom',
        html: document.getElementById('editor-container').innerHTML
    });
}

function restoreState(state) {
    if (state && state.type === 'custom') {
        document.getElementById('editor-container').innerHTML = state.html;
    }
}

quill.root.addEventListener('mousedown', function (e) {
    const range = quill.getSelection();
    if (range && range.length > 0) {
        draggedText = quill.getText(range.index, range.length);
        quill.deleteText(range.index, range.length);

        currentTextElement = document.createElement('span');
        currentTextElement.classList.add('draggable-text');
        currentTextElement.innerText = draggedText;
        document.getElementById('editor-container').appendChild(currentTextElement);

        offsetX = e.offsetX;
        offsetY = e.offsetY;

        currentTextElement.style.left = `${e.clientX - offsetX}px`;
        currentTextElement.style.top = `${e.clientY - offsetY}px`;

        isDragging = true;
        saveState();
    }
});

document.addEventListener('mouseup', function () {
    if (isDragging && currentTextElement) {
        saveState();
    }
    isDragging = false;
    currentTextElement = null;
});

document.addEventListener('mousemove', function (e) {
    if (isDragging && currentTextElement) {
        currentTextElement.style.left = `${e.clientX - offsetX}px`;
        currentTextElement.style.top = `${e.clientY - offsetY}px`;
    }
});

document.getElementById('editor-container').addEventListener('mousedown', function (e) {
    if (e.target.classList.contains('draggable-text')) {
        isDragging = true;
        currentTextElement = e.target;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        saveState();
    }
});
const originalUndo = quill.history.undo;
quill.history.undo = function () {
    const state = this.stack.undo.pop();
    if (state && state.type === 'custom') {
        restoreState(state);
        this.stack.redo.push(state);
    } else {
        originalUndo.call(quill.history);
    }
};

const originalRedo = quill.history.redo;
quill.history.redo = function () {
    const state = this.stack.redo.pop();
    if (state && state.type === 'custom') {
        restoreState(state);
        this.stack.undo.push(state);
    } else {
        originalRedo.call(quill.history);
    }
};
document.addEventListener('mouseup', function (e) {
    if (!isDragging && e.target.closest('#editor-container')) {
        quill.enable();
        quill.focus();
    }
});
