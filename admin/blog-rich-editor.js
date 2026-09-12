// ANNLETRAVEL - Rich text editor for Blog Admin
// Quill editor with direct image upload to Supabase Storage.

(function initBlogRichEditor() {
    const QUILL_CSS = "https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css";
    const QUILL_JS = "https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js";
    const BLOG_IMAGE_BUCKET = "blog-images";
    const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
    const MAX_IMAGE_WIDTH = 1800;
    const COMPRESS_THRESHOLD = 1.5 * 1024 * 1024;

    let quill = null;
    let wrapped = false;
    let imageInput = null;

    function loadCss() {
        if (document.getElementById("annletravel-quill-css")) return;
        const link = document.createElement("link");
        link.id = "annletravel-quill-css";
        link.rel = "stylesheet";
        link.href = QUILL_CSS;
        document.head.appendChild(link);
    }

    function loadQuill(callback) {
        loadCss();
        if (window.Quill) {
            callback();
            return;
        }
        const existing = document.getElementById("annletravel-quill-js");
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            return;
        }
        const script = document.createElement("script");
        script.id = "annletravel-quill-js";
        script.src = QUILL_JS;
        script.onload = callback;
        script.onerror = () => console.error("Không tải được Quill rich text editor.");
        document.head.appendChild(script);
    }

    function addStyles() {
        if (document.getElementById("annletravel-rich-editor-styles")) return;
        const style = document.createElement("style");
        style.id = "annletravel-rich-editor-styles";
        style.textContent = `
            .blog-rich-editor-shell { border: 1px solid #d8e1e5; border-radius: 10px; overflow: hidden; background: #fff; }
            .blog-rich-editor-shell .ql-toolbar.ql-snow { border: 0; border-bottom: 1px solid #e3e9ed; background: #f8fafb; padding: 9px 10px; }
            .blog-rich-editor-shell .ql-container.ql-snow { border: 0; font-family: inherit; font-size: 16px; }
            .blog-rich-editor-shell .ql-editor { min-height: 390px; padding: 18px; line-height: 1.75; }
            .blog-rich-editor-shell .ql-editor.ql-blank::before { color: #9aa6ad; font-style: normal; }
            .blog-rich-editor-shell .ql-editor h2 { margin: 18px 0 8px; font-size: 25px; }
            .blog-rich-editor-shell .ql-editor h3 { margin: 16px 0 7px; font-size: 20px; }
            .blog-rich-editor-shell .ql-editor img { max-width: 100%; height: auto; border-radius: 10px; }
            .blog-rich-editor-shell .ql-editor blockquote { border-left: 4px solid #d8e1e5; padding-left: 14px; color: #5e6b73; }
            .blog-rich-editor-note { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-top:7px; font-size:12px; color:#81909a; line-height:1.5; }
            .blog-rich-editor-note strong { color:#52616a; }
            .blog-rich-editor-status { margin-top:7px; min-height:18px; font-size:12px; color:#66727d; }
            .blog-rich-editor-status.error { color:#c0392b; }
            .blog-rich-editor-status.success { color:#237a57; }
            .blog-html-source { display:none!important; }
        `;
        document.head.appendChild(style);
    }

    function setStatus(message, type = "") {
        const status = document.getElementById("blogRichEditorStatus");
        if (!status) return;
        status.className = `blog-rich-editor-status ${type}`.trim();
        status.textContent = message || "";
    }

    function getSafeFileName(file) {
        const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const base = file.name
            .replace(/\.[^/.]+$/, "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .replace(/[^a-zA-Z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60) || "blog-image";
        return `${base}-${Date.now()}.${extension}`;
    }

    function getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: image.naturalWidth, height: image.naturalHeight });
            };
            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Không đọc được kích thước ảnh."));
            };
            image.src = url;
        });
    }

    async function optimizeImage(file) {
        if (file.size <= COMPRESS_THRESHOLD) return file;
        if (!file.type.startsWith("image/")) return file;

        const dimensions = await getImageDimensions(file);
        if (dimensions.width <= MAX_IMAGE_WIDTH && file.size <= COMPRESS_THRESHOLD) return file;

        const scale = Math.min(1, MAX_IMAGE_WIDTH / dimensions.width);
        const width = Math.max(1, Math.round(dimensions.width * scale));
        const height = Math.max(1, Math.round(dimensions.height * scale));

        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.84));
        if (!blob) return file;

        return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: "image/jpeg",
            lastModified: Date.now()
        });
    }

    async function uploadImage(file) {
        if (!file || !file.type.startsWith("image/")) {
            throw new Error("Vui lòng chọn file ảnh JPG, PNG, WEBP... .");
        }
        if (file.size > MAX_IMAGE_SIZE) {
            throw new Error("Ảnh gốc không được lớn hơn 8 MB.");
        }
        if (!window.supabaseClient) {
            throw new Error("Chưa khởi tạo kết nối Supabase.");
        }

        setStatus("Đang tối ưu ảnh...", "");
        const optimized = await optimizeImage(file);
        const fileName = getSafeFileName(optimized);
        const path = `blog/${new Date().toISOString().slice(0, 10)}/${fileName}`;

        setStatus("Đang tải ảnh lên...", "");
        const { error } = await window.supabaseClient.storage
            .from(BLOG_IMAGE_BUCKET)
            .upload(path, optimized, {
                cacheControl: "3600",
                contentType: optimized.type,
                upsert: false
            });

        if (error) {
            console.error("Blog image upload error:", error);
            throw new Error(error.message || "Không thể tải ảnh lên.");
        }

        const { data } = window.supabaseClient.storage
            .from(BLOG_IMAGE_BUCKET)
            .getPublicUrl(path);

        if (!data?.publicUrl) {
            throw new Error("Tải ảnh thành công nhưng không lấy được URL ảnh.");
        }

        return data.publicUrl;
    }

    function insertImage(url, altText = "") {
        if (!quill || !url) return;
        const range = quill.getSelection(true) || { index: Math.max(0, quill.getLength() - 1) };
        quill.insertEmbed(range.index, "image", url, "user");
        quill.setSelection(range.index + 1, 0, "silent");

        const images = quill.root.querySelectorAll("img");
        const image = images[images.length - 1];
        if (image && altText) image.setAttribute("alt", altText);
        syncHtml();
    }

    async function handleImageFile(file) {
        if (!file) return;
        try {
            const url = await uploadImage(file);
            const altText = window.prompt("Mô tả ảnh (alt text, có thể bỏ trống):", file.name.replace(/\.[^/.]+$/, "")) || "";
            insertImage(url, altText.trim());
            setStatus("Đã tải và chèn ảnh vào bài viết.", "success");
        } catch (error) {
            console.error("Handle blog image error:", error);
            setStatus(error.message || "Không thể tải ảnh.", "error");
            alert(`Không thể tải ảnh lên.\n\n${error.message || "Lỗi không xác định."}`);
        } finally {
            if (imageInput) imageInput.value = "";
        }
    }

    function ensureImageInput() {
        if (imageInput) return imageInput;
        imageInput = document.createElement("input");
        imageInput.type = "file";
        imageInput.accept = "image/*";
        imageInput.style.display = "none";
        imageInput.addEventListener("change", event => handleImageFile(event.target.files?.[0]));
        document.body.appendChild(imageInput);
        return imageInput;
    }

    function openImagePicker() {
        ensureImageInput().click();
    }

    function handleDrop(event) {
        const file = Array.from(event.dataTransfer?.files || []).find(item => item.type.startsWith("image/"));
        if (!file) return;
        event.preventDefault();
        handleImageFile(file);
    }

    function handlePaste(event) {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find(item => item.type.startsWith("image/"));
        if (!imageItem) return;
        const file = imageItem.getAsFile();
        if (!file) return;
        event.preventDefault();
        handleImageFile(file);
    }

    function ensureEditor() {
        const textarea = document.getElementById("blogContent");
        if (!textarea || !window.Quill) return null;
        if (quill && document.body.contains(quill.root)) return quill;

        const shell = document.createElement("div");
        shell.className = "blog-rich-editor-shell";
        shell.id = "blogRichEditorShell";

        const toolbar = document.createElement("div");
        toolbar.id = "blogRichEditorToolbar";
        toolbar.innerHTML = `
            <span class="ql-formats">
                <select class="ql-header"><option value="2"></option><option value="3"></option><option selected></option></select>
            </span>
            <span class="ql-formats">
                <button class="ql-bold"></button><button class="ql-italic"></button><button class="ql-underline"></button><button class="ql-strike"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-blockquote"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-list" value="ordered"></button><button class="ql-list" value="bullet"></button>
                <select class="ql-align"></select>
            </span>
            <span class="ql-formats">
                <button class="ql-link"></button><button class="ql-image" title="Tải ảnh lên"></button>
                <select class="ql-color"></select><select class="ql-background"></select>
            </span>
            <span class="ql-formats"><button class="ql-clean"></button></span>
        `;

        const editor = document.createElement("div");
        editor.id = "blogRichEditor";
        editor.innerHTML = "<p><br></p>";

        shell.appendChild(toolbar);
        shell.appendChild(editor);
        textarea.parentNode.insertBefore(shell, textarea);
        textarea.classList.add("blog-html-source");
        textarea.setAttribute("aria-hidden", "true");

        quill = new Quill(editor, {
            theme: "snow",
            placeholder: "Bắt đầu viết bài như Word...",
            modules: {
                toolbar: {
                    container: "#blogRichEditorToolbar",
                    handlers: {
                        image: openImagePicker
                    }
                }
            }
        });

        quill.on("text-change", function () {
            textarea.value = quill.root.innerHTML;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
        });

        editor.addEventListener("drop", handleDrop);
        editor.addEventListener("dragover", event => event.preventDefault());
        editor.addEventListener("paste", handlePaste);

        const note = document.createElement("div");
        note.className = "blog-rich-editor-note";
        note.innerHTML = "<span><strong>Soạn thảo như Word:</strong> tiêu đề, in đậm, danh sách, link, ảnh, căn lề...</span><span>Chọn nút ảnh, kéo-thả hoặc Ctrl+V ảnh để tải trực tiếp.</span>";
        shell.parentNode.insertBefore(note, textarea.nextSibling);

        const status = document.createElement("div");
        status.id = "blogRichEditorStatus";
        status.className = "blog-rich-editor-status";
        shell.parentNode.insertBefore(status, textarea.nextSibling);

        return quill;
    }

    function setHtml(html) {
        if (!quill) return;
        const value = String(html || "").trim();
        quill.setText("");
        if (value) quill.clipboard.dangerouslyPasteHTML(value, "api");
        const textarea = document.getElementById("blogContent");
        if (textarea) textarea.value = quill.root.innerHTML;
        setStatus("");
    }

    function syncHtml() {
        const textarea = document.getElementById("blogContent");
        if (quill && textarea) textarea.value = quill.root.innerHTML;
    }

    function wrapEditorOpen() {
        if (wrapped || typeof window.openEmbeddedBlogEditor !== "function") return;
        const original = window.openEmbeddedBlogEditor;
        window.openEmbeddedBlogEditor = function (post) {
            original.apply(this, arguments);
            setTimeout(() => {
                const editor = ensureEditor();
                if (editor) setHtml(post?.content || document.getElementById("blogContent")?.value || "");
            }, 0);
        };
        wrapped = true;
    }

    function watchForBlogEditor() {
        addStyles();
        ensureImageInput();
        loadQuill(() => {
            wrapEditorOpen();
            const observer = new MutationObserver(() => {
                const textarea = document.getElementById("blogContent");
                if (textarea && !quill) ensureEditor();
                wrapEditorOpen();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            if (document.getElementById("blogContent")) ensureEditor();
        });

        document.addEventListener("submit", event => {
            if (event.target?.id === "blogPostForm") syncHtml();
        }, true);

        document.addEventListener("click", event => {
            const target = event.target.closest("#blogBackButton, #blogCancelEdit");
            if (target && quill) setHtml("");
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchForBlogEditor);
    else watchForBlogEditor();
})();
