// ANNLETRAVEL - Local Blog image resize
// No external resize library / no additional CDN dependency.
(function () {
    "use strict";

    var MIN_WIDTH = 120;
    var shell = null;
    var editor = null;
    var overlay = null;
    var selectedImage = null;
    var resizeState = null;
    var attached = false;

    function ensureOverlay() {
        if (!shell || overlay) return;

        overlay = document.createElement("div");
        overlay.id = "blogImageResizeOverlay";
        overlay.innerHTML = [
            '<div class="blog-image-resize-toolbar">',
            '  <button type="button" data-align="left" title="Căn trái">←</button>',
            '  <button type="button" data-align="center" title="Căn giữa">●</button>',
            '  <button type="button" data-align="right" title="Căn phải">→</button>',
            '  <span class="blog-image-resize-size"></span>',
            '</div>',
            '<span class="blog-image-resize-handle nw" data-corner="nw"></span>',
            '<span class="blog-image-resize-handle ne" data-corner="ne"></span>',
            '<span class="blog-image-resize-handle sw" data-corner="sw"></span>',
            '<span class="blog-image-resize-handle se" data-corner="se"></span>'
        ].join("");

        shell.style.position = shell.style.position || "relative";
        shell.appendChild(overlay);

        overlay.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-align]");
            if (!button || !selectedImage) return;
            event.preventDefault();
            event.stopPropagation();
            applyAlignment(button.getAttribute("data-align"));
        });

        overlay.querySelectorAll(".blog-image-resize-handle").forEach(function (handle) {
            handle.addEventListener("pointerdown", startResize);
        });
    }

    function addStyles() {
        if (document.getElementById("blogImageResizeStyles")) return;

        var style = document.createElement("style");
        style.id = "blogImageResizeStyles";
        style.textContent = [
            "#blogImageResizeOverlay{position:absolute;display:none;z-index:20;box-sizing:border-box;border:1px solid #2563eb;pointer-events:none;}",
            "#blogImageResizeOverlay .blog-image-resize-handle{position:absolute;width:10px;height:10px;border:2px solid #fff;background:#2563eb;border-radius:50%;box-sizing:border-box;pointer-events:auto;z-index:22;}",
            "#blogImageResizeOverlay .nw{left:-6px;top:-6px;cursor:nwse-resize}",
            "#blogImageResizeOverlay .se{right:-6px;bottom:-6px;cursor:nwse-resize}",
            "#blogImageResizeOverlay .ne{right:-6px;top:-6px;cursor:nesw-resize}",
            "#blogImageResizeOverlay .sw{left:-6px;bottom:-6px;cursor:nesw-resize}",
            "#blogImageResizeOverlay .blog-image-resize-toolbar{position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);display:flex;align-items:center;gap:3px;padding:4px 6px;background:#111827;color:#fff;border-radius:7px;box-shadow:0 4px 14px rgba(0,0,0,.2);white-space:nowrap;pointer-events:auto;font:12px/1.2 Arial,sans-serif;}",
            "#blogImageResizeOverlay .blog-image-resize-toolbar button{border:0;background:transparent;color:#fff;cursor:pointer;width:26px;height:24px;border-radius:4px;font-size:14px;}",
            "#blogImageResizeOverlay .blog-image-resize-toolbar button:hover{background:rgba(255,255,255,.16)}",
            "#blogImageResizeOverlay .blog-image-resize-size{min-width:58px;text-align:center;opacity:.85;padding-left:4px}",
            "#blogRichEditor img.blog-image-resize-selected{outline:2px solid rgba(37,99,235,.18);}",
            "#blogRichEditor img{max-width:100%;height:auto;cursor:pointer;}",
            "#blogRichEditor img.blog-image-align-left{display:block;margin-left:0;margin-right:auto}",
            "#blogRichEditor img.blog-image-align-center{display:block;margin-left:auto;margin-right:auto}",
            "#blogRichEditor img.blog-image-align-right{display:block;margin-left:auto;margin-right:0}"
        ].join("");
        document.head.appendChild(style);
    }

    function syncHtml() {
        var textarea = document.getElementById("blogContent");
        if (!editor || !textarea) return;
        textarea.value = editor.innerHTML;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function updateOverlay() {
        if (!overlay || !selectedImage || !shell) return;
        if (!document.body.contains(selectedImage)) {
            clearSelection();
            return;
        }

        var imageRect = selectedImage.getBoundingClientRect();
        var shellRect = shell.getBoundingClientRect();
        var left = imageRect.left - shellRect.left + shell.scrollLeft;
        var top = imageRect.top - shellRect.top + shell.scrollTop;

        overlay.style.display = "block";
        overlay.style.left = Math.round(left) + "px";
        overlay.style.top = Math.round(top) + "px";
        overlay.style.width = Math.round(imageRect.width) + "px";
        overlay.style.height = Math.round(imageRect.height) + "px";

        var size = overlay.querySelector(".blog-image-resize-size");
        if (size) size.textContent = Math.round(imageRect.width) + " px";
    }

    function selectImage(image) {
        if (!image || image === selectedImage) {
            if (image) updateOverlay();
            return;
        }
        if (selectedImage) selectedImage.classList.remove("blog-image-resize-selected");
        selectedImage = image;
        selectedImage.classList.add("blog-image-resize-selected");
        updateOverlay();
    }

    function clearSelection() {
        if (selectedImage) selectedImage.classList.remove("blog-image-resize-selected");
        selectedImage = null;
        if (overlay) overlay.style.display = "none";
    }

    function applyAlignment(align) {
        if (!selectedImage) return;

        selectedImage.classList.remove(
            "blog-image-align-left",
            "blog-image-align-center",
            "blog-image-align-right"
        );
        selectedImage.classList.add("blog-image-align-" + align);

        if (align === "left") {
            selectedImage.style.marginLeft = "0";
            selectedImage.style.marginRight = "auto";
        } else if (align === "center") {
            selectedImage.style.marginLeft = "auto";
            selectedImage.style.marginRight = "auto";
        } else {
            selectedImage.style.marginLeft = "auto";
            selectedImage.style.marginRight = "0";
        }

        syncHtml();
        updateOverlay();
    }

    function startResize(event) {
        if (!selectedImage) return;
        event.preventDefault();
        event.stopPropagation();

        var rect = selectedImage.getBoundingClientRect();
        var naturalWidth = selectedImage.naturalWidth || rect.width;
        var naturalHeight = selectedImage.naturalHeight || rect.height;
        var ratio = naturalHeight / naturalWidth || 1;
        var corner = event.currentTarget.getAttribute("data-corner");

        resizeState = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startWidth: rect.width,
            startHeight: rect.height,
            ratio: ratio,
            corner: corner
        };

        event.currentTarget.setPointerCapture(event.pointerId);
        document.body.style.userSelect = "none";
        document.addEventListener("pointermove", resizeImage);
        document.addEventListener("pointerup", finishResize, { once: true });
    }

    function resizeImage(event) {
        if (!resizeState || !selectedImage) return;

        var dx = event.clientX - resizeState.startX;
        var dy = event.clientY - resizeState.startY;
        var delta;

        if (resizeState.corner === "ne" || resizeState.corner === "se") {
            delta = dx;
        } else {
            delta = -dx;
        }

        // Blend horizontal/vertical movement so dragging any corner feels natural.
        if (Math.abs(dx) < 4 && Math.abs(dy) >= 4) {
            delta = (resizeState.corner === "nw" || resizeState.corner === "ne") ? -dy / resizeState.ratio : dy / resizeState.ratio;
        }

        var maxWidth = Math.min(
            editor.clientWidth || resizeState.startWidth,
            (shell.clientWidth || Infinity) - 8
        );
        var width = Math.round(resizeState.startWidth + delta);
        width = Math.max(MIN_WIDTH, Math.min(maxWidth, width));

        selectedImage.style.width = width + "px";
        selectedImage.style.height = "auto";
        selectedImage.setAttribute("width", String(width));

        updateOverlay();
    }

    function finishResize() {
        if (!resizeState) return;
        resizeState = null;
        document.body.style.userSelect = "";
        document.removeEventListener("pointermove", resizeImage);
        syncHtml();
        updateOverlay();
    }

    function onEditorClick(event) {
        var image = event.target.closest("img");
        if (image && editor.contains(image)) {
            event.preventDefault();
            event.stopPropagation();
            selectImage(image);
            return;
        }
        if (!event.target.closest("#blogImageResizeOverlay")) clearSelection();
    }

    function attach() {
        var currentEditor = document.getElementById("blogRichEditor");
        if (!currentEditor || attached) return;

        editor = currentEditor;
        shell = document.getElementById("blogRichEditorShell") || editor.parentElement;
        if (!shell) return;

        addStyles();
        ensureOverlay();
        editor.addEventListener("click", onEditorClick);
        shell.addEventListener("scroll", updateOverlay, true);
        window.addEventListener("resize", updateOverlay);
        attached = true;
    }

    function watch() {
        attach();
        var observer = new MutationObserver(function () {
            if (!attached) attach();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", watch);
    } else {
        watch();
    }
})();
