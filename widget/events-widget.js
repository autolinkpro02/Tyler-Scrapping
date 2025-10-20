// widget/events-widget.js
(function () {
    async function init() {
      const root = document.getElementById('events-widget');
      if (!root) return;
      const geo = root.dataset.geo || 'boise-id';
      let days = 30;
      let tab = 'family';
  
      root.innerHTML = `
        <div class="ew-controls">
          <div class="ew-toggle">
            <button data-days="30" class="active">30 days</button>
            <button data-days="60">60 days</button>
          </div>
          <div class="ew-tabs">
            <button data-tab="family" class="active">Family</button>
            <button data-tab="adults">Adults</button>
          </div>
        </div>
        <ul class="ew-list"></ul>
      `;
  
      const list = root.querySelector('.ew-list');
  
      async function load() {
        list.innerHTML = `<li class="loading">Loading…</li>`;
        try {
          const res = await fetch(
            `https://kbkzexneviwstahmydqb.supabase.co/functions/v1/events?geo=${geo}&days=${days}`
          );
          const json = await res.json();
          const items = json[tab] || [];
          list.innerHTML = items.length
            ? items
                .map(
                  (e) => `
                <li class="ew-item">
                  <a href="${e.urlOfficial}" target="_blank">${e.title}</a>
                  <div class="time">${new Date(e.startsAt).toLocaleString()}</div>
                  ${e.venueName ? `<div class="venue">${e.venueName}</div>` : ''}
                  ${
                    e.priceMin != null
                      ? `<div class="price">$${e.priceMin}${
                          e.priceMax ? `–$${e.priceMax}` : ''
                        }</div>`
                      : ''
                  }
                </li>`
                )
                .join('')
            : `<li>No events found.</li>`;
        } catch (err) {
          list.innerHTML = `<li>Error: ${err.message}</li>`;
        }
      }
  
      root.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.days) {
          days = Number(b.dataset.days);
          root.querySelectorAll('.ew-toggle button').forEach((x) => x.classList.remove('active'));
          b.classList.add('active');
          load();
        }
        if (b.dataset.tab) {
          tab = b.dataset.tab;
          root.querySelectorAll('.ew-tabs button').forEach((x) => x.classList.remove('active'));
          b.classList.add('active');
          load();
        }
      });
  
      load();
    }
  
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
  })();
  