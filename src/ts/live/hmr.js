// hmr.js

const ws = new WebSocket("ws://localhost:{{PORT}}");

ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    console.log("HMR update received:", update);

    if (update.type === "hmr") {
        if (update.module === "style") {
            updateCSS(update.data);
        } else {
            console.log("HMR: Reloading affected module:", update.module);
        }
    } else if (update.type === "reload") {
        console.log("HMR: Full page reload triggered.");
        window.location.reload();
    }
};

function updateCSS(css) {
    const styleElement = document.createElement("style");
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}
