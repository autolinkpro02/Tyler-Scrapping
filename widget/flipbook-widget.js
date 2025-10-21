// widget/flipbook-widget.js
(function(){
    async function renderFlipbookTab(root, apiBase, market){
      try {
        const res = await fetch(`${apiBase}/flipbook?market=${encodeURIComponent(market)}`);
        const { flipbook } = await res.json();
  
        if(!flipbook){
          root.innerHTML = `<p>No issue available yet.</p>`;
          return;
        }
  
        // 1️⃣ Prefer full embed HTML
        if (flipbook.embed_html) {
          root.innerHTML = flipbook.embed_html;
          return;
        }
  
        // 2️⃣ Or iframe embed URL
        if (flipbook.embed_url) {
          root.innerHTML = `
            <iframe src="${flipbook.embed_url}"
              style="width:100%;height:80vh;border:0"
              allowfullscreen loading="lazy"></iframe>`;
          return;
        }
  
        // 3️⃣ Fallback to PDF view
        if (flipbook.pdf_url) {
          root.innerHTML = `
            <p><strong>${flipbook.title}</strong></p>
            <iframe src="${flipbook.pdf_url}" style="width:100%;height:80vh;border:0"></iframe>
            <p><a href="${flipbook.pdf_url}" target="_blank" rel="noopener">Download PDF</a></p>`;
          return;
        }
  
        root.innerHTML = `<p>Flipbook misconfigured (no embed or PDF).</p>`;
      } catch (err) {
        console.error("Flipbook tab error:", err);
        root.innerHTML = `<p>Could not load flipbook.</p>`;
      }
    }
  
    // Expose globally so your main widget can call it
    window.renderFlipbookTab = renderFlipbookTab;
  })();
  