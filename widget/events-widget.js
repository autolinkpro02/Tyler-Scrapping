// widget/events-widget.js
(function(){
    async function init(){
      const root = document.getElementById('events-widget');
      if(!root) return;
  
      const geo = root.dataset.geo || 'boise-id';
      const apiBase = root.dataset.api || 'https://kbkzexneviwstahmydqb.supabase.co/functions/v1';
      let days = 30;
      let tab = 'family';
      
      // API token for authentication
      const apiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtia3pleG5ldml3c3RhaG15ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjU4MjQsImV4cCI6MjA3NjAwMTgyNH0.8zi6u6tq011oDEHGkTw0OGAINqyBz7ne0pojd2ujut4';
  
      root.innerHTML = `
  <div class="ew-controls">
    <div class="ew-toggles">
      <button data-days="30" class="ew-toggle active">30 Days</button>
      <button data-days="60" class="ew-toggle">60 Days</button>
    </div>
    <div class="ew-tabs">
      <button data-tab="family" class="active">Family Friendly</button>
      <button data-tab="adults">Adults Only</button>
      <button data-tab="flipbook">Magazine</button>
    </div>
  </div>
  <ul class="ew-list"></ul>
`;

  
      const list = root.querySelector('.ew-list');
  
      // async function load(){
      //   list.innerHTML = `<li>Loading events…</li>`;
      //   const res = await fetch(`${apiBase}/events?geo=${geo}&days=${days}`);
      //   const json = await res.json();
      //   const items = json[tab] || [];
  
      //   list.innerHTML = items.length
      //     ? items.map(i => `
      //         <li class="ew-item">
      //           <a href="${i.urlOfficial}" target="_blank" rel="noopener">${i.title}</a>
      //           <div>${new Date(i.startsAt).toLocaleString()}</div>
      //           ${i.venueName ? `<div>${i.venueName}</div>` : ""}
      //           ${i.priceMin != null ? `<div>$${i.priceMin}${i.priceMax?`–$${i.priceMax}`:''}</div>` : ""}
      //         </li>
      //       `).join('')
      //     : `<li>No events found.</li>`;
      // }

      async function load(){
        console.log('Loading with tab:', tab, 'days:', days);
        list.innerHTML = `<li>Loading...</li>`;
      
        // 🧠 If tab = flipbook, call renderFlipbookTab()
        if (tab === 'flipbook') {
          // clear the list and render flipbook iframe
          list.innerHTML = `<li>Loading magazine...</li>`;
          // Use the global function from flipbook-widget.js
          await window.renderFlipbookTab(list, apiBase, geo.replace('-id', ''));
          return;
        }
      
        // Normal events tab logic
        try {
          // Try GET first (some APIs support both GET and POST)
          let res = await fetch(`${apiBase}/events?geo=${geo}&days=${days}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          });
          
          // If GET fails, try POST
          if (!res.ok && res.status === 405) {
            console.log('GET failed, trying POST...');
            res = await fetch(`${apiBase}/events?geo=${geo}&days=${days}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
              },
              mode: 'cors'
            });
          }
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const json = await res.json();
          console.log('API response:', json);
          const items = json[tab] || [];
          console.log('Items for tab', tab, ':', items);
        
          list.innerHTML = items.length
            ? items.map(i => `
                <li class="ew-item">
                  <a href="${i.url_official}" target="_blank" rel="noopener">${i.title}</a>
                  <div>${new Date(i.starts_at).toLocaleString()}</div>
                  ${i.venue_name ? `<div>${i.venue_name}</div>` : ""}
                  ${i.price_min != null ? `<div>$${i.price_min}${i.price_max?`–$${i.price_max}`:''}</div>` : ""}
                </li>
              `).join('')
            : `<li>No events found.</li>`;
        } catch (error) {
          console.error('Error loading events:', error);
          list.innerHTML = `<li>Error loading events: ${error.message}</li>`;
        }
      }
      
  
      // handle clicks
      root.addEventListener('click', e => {
        const b = e.target.closest('button');
        if(!b) return;
  
        if(b.dataset.days){
          days = Number(b.dataset.days);
          root.querySelectorAll('.ew-toggle').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          load();
        }
        if(b.dataset.tab){
          tab = b.dataset.tab;
          root.querySelectorAll('.ew-tabs button').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          load();
        }
      });
  
      load();
    }
  
    if(document.readyState!=='loading') init();
    else document.addEventListener('DOMContentLoaded', init);
  })();
  