// ANNLETRAVEL - Rich text editor for Blog Admin
// Uses Quill to provide a Word-like editor while saving clean HTML to blog_posts.content.

(function initBlogRichEditor() {
    const QUILL_CSS = "https://cdn.jsdelivr.net/npm/[email protected]/dist/quill.snow.css";
    const QUILL_JS = "https://cdn.jsdelivr.net/npm/[email protected]/dist/quill.min.js";
    let quill = null;
    let wrapped = false;

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
            .blog-rich-editor-shell .ql-editor img { max-width: 100%; border-radius: 10px; }
            .blog-rich-editor-shell .ql-editor blockquote { border-left: 4px solid #d8e1e5; padding-left: 14px; color: #5e6b73; }
            .blog-rich-editor-note { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-top:7px; font-size:12px; color:#81909a; line-height:1.5; }
            .blog-rich-editor-note strong { color:#52616a; }
            .blog-html-source { display:none!important; }
        `;
        document.head.appendChild(style);
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
                <select class="ql-font"></select>
            </span>
            <span class="ql-formats">
                <button class="ql-bold"></button><button class="ql-italic"></button><button class="ql-underline"></button><button class="ql-strike"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-blockquote"></button><button class="ql-code-block"></button>
            </span>
            <span class="ql-formats">
                <button class="ql-list" value="ordered"></button><button class="ql-list" value="bullet"></button>
                <select class="ql-align"></select>
            </span>
            <span class="ql-formats">
                <button class="ql-link"></button><button class="ql-image"></button>
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
                        image: function () {
                            const url = window.prompt("Dán URL ảnh:");
                            if (!url) return;
                            const range = this.quill.getSelection(true);
                            this.quill.insertEmbed(range ? range.index : this.quill.getLength(), "image", url, "user");
                        }
                    }
                }
            }
        });

        quill.on("text-change", function () {
            textarea.value = quill.root.innerHTML;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
        });

        const note = document.createElement("div");
        note.className = "blog-rich-editor-note";
        note.innerHTML = "<span><strong>Soạn thảo như Word:</strong> tiêu đề, in đậm, danh sách, link, ảnh, căn lề...</span><span>HTML sẽ được tự động tạo khi lưu.</span>";
        shell.parentNode.insertBefore(note, textarea.nextSibling);

        return quill;
    }

    function setHtml(html) {
        if (!quill) return;
        const value = String(html || "").trim();
        quill.setText("");
        if (value) quill.clipboard.dangerouslyPasteHTML(value, "api");
        const textarea = document.getElementById("blogContent");
        if (textarea) textarea.value = quill.root.innerHTML;
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
