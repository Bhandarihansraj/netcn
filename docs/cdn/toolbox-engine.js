/* ============================================================
   netcn Toolbox CDN — Universal Engine v2.0
   
   Usage (in ANY HTML page):
     <link rel="stylesheet" href="https://bhandarihansraj.github.io/netcn/cdn/toolbox.css" />
     <script src="https://bhandarihansraj.github.io/netcn/cdn/toolbox-engine.js"></script>
     <div class="netcn-toolbox" data-tool="parking-lot"></div>
     <div class="netcn-toolbox" data-tool="standard-controls"></div>
   ============================================================ */

(function () {
    'use strict';

    var CDN_BASE = (function () {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src || '';
            if (src.indexOf('toolbox-engine.js') !== -1) {
                return src.replace(/cdn\/toolbox-engine\.js.*$/, 'cdn/');
            }
        }
        return 'https://bhandarihansraj.github.io/netcn/cdn/';
    })();

    var CAR_COLORS = ['red', 'blue', 'green', 'purple', 'orange', 'teal', 'white', 'yellow'];
    var _counter = Date.now();

    document.addEventListener('DOMContentLoaded', function () {
        var containers = document.querySelectorAll('.netcn-toolbox[data-tool]');
        for (var i = 0; i < containers.length; i++) {
            initToolbox(containers[i]);
        }
    });

    function initToolbox(container) {
        var toolId = container.getAttribute('data-tool');
        if (!toolId) return;
        container.innerHTML =
            '<div class="netcn-loading"><div class="spinner"></div><p>Loading <strong>' + toolId + '</strong> from CDN...</p></div>';

        fetch(CDN_BASE + 'tools/' + toolId + '.json')
            .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
            .then(function (config) { renderTool(container, toolId, config); })
            .catch(function (err) {
                container.innerHTML = '<div class="netcn-error"><h3>⚠️ Tool Not Found</h3><p>' + err.message + '</p></div>';
            });
    }

    function renderTool(container, toolId, config) {
        container.innerHTML = '';
        var header = el('div', 'netcn-header');
        var title = el('h2');
        title.innerHTML = '🛠️ ' + esc(config.title);
        var badge = el('span', 'netcn-badge');
        badge.textContent = 'netcn CDN v2.0';
        header.appendChild(title);
        header.appendChild(badge);
        container.appendChild(header);

        var desc = el('div', 'netcn-description');
        desc.textContent = config.description || '';
        container.appendChild(desc);

        if (config.type === 'parking-lot') {
            renderParkingLot(container, toolId, config);
        } else if (config.type === 'standard-controls') {
            renderStandardControls(container, toolId, config);
        } else if (config.type === 'aspnet-practicals') {
            renderAspnetPracticals(container, toolId, config);
        } else if (config.type === 'aspnet-generator') {
            renderAspnetGenerator(container, toolId, config);
        } else {
            var err = el('div', 'netcn-error');
            err.innerHTML = '<p>Unknown tool type: <strong>' + esc(config.type) + '</strong></p>';
            container.appendChild(err);
        }
    }

    /* ================================================================
       PARKING LOT — with Add / Edit / Remove
       ================================================================ */
    function renderParkingLot(container, toolId, config) {
        var STORAGE_KEY = 'netcn_parking_' + toolId;
        var state = null;
        try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) {}
        if (!state || !state.cards) state = { cards: JSON.parse(JSON.stringify(config.initialCards || [])) };

        // Toolbar — Add New Card button
        var toolbar = el('div', 'netcn-toolbar');
        var addBtn = el('button', 'netcn-btn netcn-btn-add');
        addBtn.innerHTML = '➕ Add New Card';
        addBtn.addEventListener('click', function () {
            showAddCardModal(container, STORAGE_KEY, config.columns);
        });
        var resetBtn = el('button', 'netcn-btn netcn-btn-reset');
        resetBtn.innerHTML = '🔄 Reset Board';
        resetBtn.addEventListener('click', function () {
            localStorage.removeItem(STORAGE_KEY);
            renderParkingLot(container, toolId, config);
        });
        toolbar.appendChild(addBtn);
        toolbar.appendChild(resetBtn);
        container.appendChild(toolbar);

        var board = el('div', 'netcn-parking-lot');
        var zones = {};

        config.columns.forEach(function (col) {
            var zone = el('div', 'netcn-zone');
            zone.setAttribute('data-zone', col.id);
            var zh = el('div', 'netcn-zone-header');
            var zhTitle = el('h4');
            var count = state.cards.filter(function (c) { return c.col === col.id; }).length;
            zhTitle.innerHTML = esc(col.title) + ' <span class="netcn-count">' + count + '</span>';
            zh.appendChild(zhTitle);
            zone.appendChild(zh);

            var zb = el('div', 'netcn-zone-body');
            zb.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
            zb.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
            zb.addEventListener('drop', function (e) {
                e.preventDefault();
                zone.classList.remove('drag-over');
                var cardId = e.dataTransfer.getData('text/plain');
                var cardEl = document.getElementById(cardId);
                if (cardEl) { zb.appendChild(cardEl); saveState(container, STORAGE_KEY); }
            });

            zone.appendChild(zb);
            board.appendChild(zone);
            zones[col.id] = zb;
        });

        state.cards.forEach(function (card) {
            var cardEl = createCar(card, container, STORAGE_KEY);
            if (zones[card.col]) zones[card.col].appendChild(cardEl);
        });

        container.appendChild(board);
    }

    function createCar(card, container, storageKey) {
        var color = card.color || CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
        card.color = color;
        var div = el('div', 'netcn-car car-' + color);
        div.id = card.id;
        div.draggable = true;

        var hdr = el('div', 'netcn-car-header');
        var idBadge = el('span', 'netcn-car-id');
        idBadge.textContent = card.id;

        // Action buttons: Edit + Delete
        var actions = el('span', 'netcn-car-actions');
        var editBtn = el('button', 'netcn-car-btn');
        editBtn.textContent = '✏️';
        editBtn.title = 'Edit';
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var newTitle = prompt('Edit card title:', card.title);
            if (newTitle && newTitle.trim()) {
                card.title = newTitle.trim();
                div.querySelector('.netcn-car-title').textContent = card.title;
                saveState(container, storageKey);
            }
        });
        var delBtn = el('button', 'netcn-car-btn netcn-car-btn-del');
        delBtn.textContent = '✕';
        delBtn.title = 'Remove';
        delBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (confirm('Remove "' + card.title + '"?')) {
                div.remove();
                saveState(container, storageKey);
            }
        });
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        hdr.appendChild(idBadge);
        hdr.appendChild(actions);

        var titleEl = el('span', 'netcn-car-title');
        titleEl.textContent = card.title;

        div.appendChild(hdr);
        div.appendChild(titleEl);

        div.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', div.id); div.classList.add('dragging'); });
        div.addEventListener('dragend', function () { div.classList.remove('dragging'); });

        return div;
    }

    function showAddCardModal(container, storageKey, columns) {
        var existing = container.querySelector('.netcn-modal-overlay');
        if (existing) existing.remove();

        var overlay = el('div', 'netcn-modal-overlay');
        var modal = el('div', 'netcn-modal');
        modal.innerHTML =
            '<h3>➕ Add New Card</h3>' +
            '<label>Title</label>' +
            '<input type="text" id="netcn-new-title" class="netcn-input" placeholder="What needs to be done?" autofocus />' +
            '<label>Zone</label>' +
            '<select id="netcn-new-zone" class="netcn-input">' +
            columns.map(function (c) { return '<option value="' + c.id + '">' + c.title + '</option>'; }).join('') +
            '</select>' +
            '<label>Color</label>' +
            '<div class="netcn-color-picker" id="netcn-color-picker">' +
            CAR_COLORS.map(function (c) { return '<span class="netcn-color-dot car-' + c + '" data-color="' + c + '"></span>'; }).join('') +
            '</div>' +
            '<div class="netcn-modal-actions">' +
            '<button class="netcn-btn netcn-btn-add" id="netcn-modal-save">Add Card</button>' +
            '<button class="netcn-btn netcn-btn-reset" id="netcn-modal-cancel">Cancel</button>' +
            '</div>';

        overlay.appendChild(modal);
        container.appendChild(overlay);

        // Color picker logic
        var selectedColor = 'blue';
        var dots = modal.querySelectorAll('.netcn-color-dot');
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                dots.forEach(function (d) { d.classList.remove('selected'); });
                dot.classList.add('selected');
                selectedColor = dot.getAttribute('data-color');
            });
        });
        // Default selection
        if (dots[1]) dots[1].classList.add('selected');

        modal.querySelector('#netcn-modal-cancel').addEventListener('click', function () { overlay.remove(); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });

        modal.querySelector('#netcn-modal-save').addEventListener('click', function () {
            var title = modal.querySelector('#netcn-new-title').value.trim();
            var zone = modal.querySelector('#netcn-new-zone').value;
            if (!title) { modal.querySelector('#netcn-new-title').focus(); return; }

            var newCard = { id: 'car-' + (++_counter), title: title, col: zone, color: selectedColor };
            var zoneBody = container.querySelector('.netcn-zone[data-zone="' + zone + '"] .netcn-zone-body');
            if (zoneBody) {
                zoneBody.appendChild(createCar(newCard, container, storageKey));
                saveState(container, storageKey);
            }
            overlay.remove();
        });
    }

    /* ================================================================
       STANDARD CONTROLS — VS-Style Drag & Drop Designer
       ================================================================ */
    function renderStandardControls(container, toolId, config) {
        var CANVAS_KEY = 'netcn_canvas_' + toolId;
        var board = el('div', 'netcn-controls-board');

        // Sidebar — draggable control list (like VS Toolbox)
        var sidebar = el('div', 'netcn-controls-sidebar');
        var sideTitle = el('h4', 'netcn-sidebar-title');
        sideTitle.textContent = '⚙ Toolbox';
        sidebar.appendChild(sideTitle);
        var sideHint = el('p', 'netcn-sidebar-hint');
        sideHint.textContent = 'Drag controls → drop on canvas';
        sidebar.appendChild(sideHint);

        config.controls.forEach(function (ctrl) {
            var item = el('div', 'netcn-control-item');
            item.draggable = true;
            item.setAttribute('data-ctrl-id', ctrl.id);
            item.innerHTML = '<span class="netcn-ctrl-icon">' + ctrl.icon + '</span> ' + esc(ctrl.name);
            item.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', JSON.stringify(ctrl));
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', function () { item.classList.remove('dragging'); });
            sidebar.appendChild(item);
        });

        // Canvas — drop target (like VS Designer surface)
        var canvasWrap = el('div', 'netcn-controls-preview');
        var canvasHeader = el('div', 'netcn-canvas-header');
        canvasHeader.innerHTML = '<h4>🖥️ Designer Canvas</h4>';
        var clearBtn = el('button', 'netcn-btn netcn-btn-reset');
        clearBtn.textContent = '🗑️ Clear Canvas';
        clearBtn.addEventListener('click', function () {
            canvasBody.innerHTML = '';
            localStorage.removeItem(CANVAS_KEY);
            updateCanvasCount(canvasBody, countBadge);
        });
        canvasHeader.appendChild(clearBtn);
        canvasWrap.appendChild(canvasHeader);

        var countBadge = el('span', 'netcn-canvas-count');
        countBadge.textContent = '0 controls';
        canvasHeader.appendChild(countBadge);

        var canvasBody = el('div', 'netcn-canvas-body');
        canvasBody.addEventListener('dragover', function (e) {
            e.preventDefault();
            canvasBody.classList.add('drag-over');
        });
        canvasBody.addEventListener('dragleave', function () {
            canvasBody.classList.remove('drag-over');
        });
        canvasBody.addEventListener('drop', function (e) {
            e.preventDefault();
            canvasBody.classList.remove('drag-over');
            try {
                var ctrl = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (ctrl && ctrl.id) {
                    addControlToCanvas(canvasBody, ctrl, CANVAS_KEY, countBadge);
                }
            } catch (ex) { /* ignore non-control drops */ }
        });

        canvasWrap.appendChild(canvasBody);
        board.appendChild(sidebar);
        board.appendChild(canvasWrap);
        container.appendChild(board);

        // Restore saved canvas state
        try {
            var saved = JSON.parse(localStorage.getItem(CANVAS_KEY));
            if (saved && saved.controls) {
                saved.controls.forEach(function (ctrl) {
                    addControlToCanvas(canvasBody, ctrl, CANVAS_KEY, countBadge);
                });
            }
        } catch (ex) { /* ignore */ }
    }

    function addControlToCanvas(canvasBody, ctrl, storageKey, countBadge) {
        var wrapper = el('div', 'netcn-canvas-item');
        wrapper.setAttribute('data-ctrl-id', ctrl.id);

        var header = el('div', 'netcn-canvas-item-header');
        var label = el('span');
        label.textContent = ctrl.icon + ' ' + ctrl.name;
        
        var actions = el('span');
        
        var upBtn = el('button', 'netcn-canvas-btn');
        upBtn.innerHTML = '▲';
        upBtn.title = 'Move Up';
        upBtn.addEventListener('click', function () {
            var prev = wrapper.previousElementSibling;
            if (prev) {
                canvasBody.insertBefore(wrapper, prev);
                saveCanvasState(canvasBody, storageKey);
            }
        });
        
        var downBtn = el('button', 'netcn-canvas-btn');
        downBtn.innerHTML = '▼';
        downBtn.title = 'Move Down';
        downBtn.addEventListener('click', function () {
            var next = wrapper.nextElementSibling;
            if (next) {
                canvasBody.insertBefore(next, wrapper);
                saveCanvasState(canvasBody, storageKey);
            }
        });

        var delBtn = el('button', 'netcn-canvas-del');
        delBtn.textContent = '✕';
        delBtn.title = 'Remove';
        delBtn.addEventListener('click', function () {
            wrapper.remove();
            saveCanvasState(canvasBody, storageKey);
            updateCanvasCount(canvasBody, countBadge);
        });
        
        actions.appendChild(upBtn);
        actions.appendChild(downBtn);
        actions.appendChild(delBtn);

        header.appendChild(label);
        header.appendChild(actions);
        wrapper.appendChild(header);

        var body = el('div', 'netcn-canvas-item-body');
        renderLiveControl(body, ctrl);
        wrapper.appendChild(body);

        canvasBody.appendChild(wrapper);
        saveCanvasState(canvasBody, storageKey);
        updateCanvasCount(canvasBody, countBadge);
    }

    function renderLiveControl(body, ctrl) {
        var p = ctrl.properties;
        switch (ctrl.id) {
            case 'btn': var b = el('button', 'netcn-demo-btn btn-primary'); b.textContent = p.text; b.addEventListener('click', function(){ b.textContent = '✔ Clicked!'; setTimeout(function(){ b.textContent = p.text; }, 800); }); body.appendChild(b); break;
            case 'lbl': var l = el('span', 'netcn-demo-label-ctrl'); l.textContent = p.text; body.appendChild(l); break;
            case 'txt': var i = el('input', 'netcn-demo-input'); i.type = 'text'; i.placeholder = p.placeholder; body.appendChild(i); break;
            case 'chk': var cw = el('label', 'netcn-demo-check'); var ci = document.createElement('input'); ci.type = 'checkbox'; cw.appendChild(ci); cw.appendChild(document.createTextNode(' ' + p.text)); body.appendChild(cw); break;
            case 'chklist': p.items.forEach(function(item){ var w = el('label', 'netcn-demo-check'); var c = document.createElement('input'); c.type = 'checkbox'; w.appendChild(c); w.appendChild(document.createTextNode(' ' + item)); body.appendChild(w); body.appendChild(document.createElement('br')); }); break;
            case 'rad': var rw = el('label', 'netcn-demo-check'); var ri = document.createElement('input'); ri.type = 'radio'; ri.name = 'canvas_radio'; rw.appendChild(ri); rw.appendChild(document.createTextNode(' ' + p.text)); body.appendChild(rw); break;
            case 'radlist': p.items.forEach(function(item, idx){ var w = el('label', 'netcn-demo-check'); var r = document.createElement('input'); r.type = 'radio'; r.name = 'canvas_radlist_' + ctrl.id + '_' + Math.random(); r.checked = idx === p.selectedIndex; w.appendChild(r); w.appendChild(document.createTextNode(' ' + item)); body.appendChild(w); body.appendChild(document.createElement('br')); }); break;
            case 'ddl': var s = el('select', 'netcn-demo-input'); p.items.forEach(function(item){ var o = document.createElement('option'); o.textContent = item; s.appendChild(o); }); body.appendChild(s); break;
            case 'lst': var ls = el('select', 'netcn-demo-input'); ls.multiple = true; ls.size = p.rows || 4; p.items.forEach(function(item){ var o = document.createElement('option'); o.textContent = item; ls.appendChild(o); }); body.appendChild(ls); break;
            case 'lnk': var a = el('a', 'netcn-demo-link'); a.href = p.url; a.target = '_blank'; a.textContent = p.text; body.appendChild(a); break;
            case 'img': var im = el('img', 'netcn-demo-img'); im.src = p.src; im.alt = p.alt; im.style.width = p.width || '100%'; body.appendChild(im); break;
            case 'fu': var fz = el('div', 'netcn-demo-upload'); fz.innerHTML = '<p>📁 Drag files here or click</p>'; body.appendChild(fz); break;
            case 'cal': var ci2 = el('input', 'netcn-demo-input'); ci2.type = 'date'; body.appendChild(ci2); break;
            case 'pnl': var pn = el('div', 'netcn-demo-panel'); var ph = el('div', 'netcn-panel-header'); ph.textContent = p.headerText; var pb = el('div', 'netcn-panel-body'); pb.textContent = p.content; ph.addEventListener('click', function(){ pb.style.display = pb.style.display === 'none' ? 'block' : 'none'; }); pn.appendChild(ph); pn.appendChild(pb); body.appendChild(pn); break;
            case 'bl': var ul = el('ul', 'netcn-demo-list'); p.items.forEach(function(item){ var li = document.createElement('li'); li.textContent = item; ul.appendChild(li); }); body.appendChild(ul); break;
            default: body.textContent = ctrl.name + ' control';
        }
    }

    function saveCanvasState(canvasBody, storageKey) {
        var items = canvasBody.querySelectorAll('.netcn-canvas-item');
        var controls = [];
        // We save control IDs only — actual rendering is re-done from the config
        // This prevents any stored malicious content from being persisted
        items.forEach(function (item) {
            controls.push({ id: item.getAttribute('data-ctrl-id') });
        });
        localStorage.setItem(storageKey, JSON.stringify({ controls: controls }));
    }

    function updateCanvasCount(canvasBody, badge) {
        var c = canvasBody.querySelectorAll('.netcn-canvas-item').length;
        badge.textContent = c + ' control' + (c !== 1 ? 's' : '');
    }

    function renderControlPreview(previewBody, ctrl) {
        previewBody.innerHTML = '';
        var p = ctrl.properties;

        // Control info header
        var info = el('div', 'netcn-ctrl-info');
        info.innerHTML = '<h3>' + ctrl.icon + ' ' + esc(ctrl.name) + '</h3><p>' + esc(ctrl.description) + '</p><span class="netcn-ctrl-cat">' + esc(ctrl.category) + '</span>';
        previewBody.appendChild(info);

        // Live demo area
        var demo = el('div', 'netcn-ctrl-demo');
        var demoLabel = el('div', 'netcn-demo-label');
        demoLabel.textContent = 'Live Demo';
        demo.appendChild(demoLabel);

        var demoArea = el('div', 'netcn-demo-area');

        switch (ctrl.id) {
            case 'btn':
                var btn = el('button', 'netcn-demo-btn ' + (p.cssClass === 'primary' ? 'btn-primary' : 'btn-secondary'));
                btn.textContent = p.text;
                btn.disabled = !p.enabled;
                btn.addEventListener('click', function () { btn.textContent = '✔ Clicked!'; setTimeout(function(){ btn.textContent = p.text; }, 1000); });
                demoArea.appendChild(btn);
                break;

            case 'lbl':
                var lbl = el('span', 'netcn-demo-label-ctrl');
                lbl.textContent = p.text;
                if (p.bold) lbl.style.fontWeight = 'bold';
                if (p.italic) lbl.style.fontStyle = 'italic';
                demoArea.appendChild(lbl);
                break;

            case 'txt':
                if (p.mode === 'multi') {
                    var ta = el('textarea', 'netcn-demo-input');
                    ta.placeholder = p.placeholder;
                    ta.rows = 4;
                    demoArea.appendChild(ta);
                } else {
                    var inp = el('input', 'netcn-demo-input');
                    inp.type = p.mode === 'password' ? 'password' : 'text';
                    inp.placeholder = p.placeholder;
                    inp.maxLength = p.maxLength || 100;
                    demoArea.appendChild(inp);
                }
                break;

            case 'chk':
                var chkWrap = el('label', 'netcn-demo-check');
                var chkInput = document.createElement('input');
                chkInput.type = 'checkbox';
                chkInput.checked = p.checked;
                chkWrap.appendChild(chkInput);
                chkWrap.appendChild(document.createTextNode(' ' + p.text));
                demoArea.appendChild(chkWrap);
                break;

            case 'chklist':
                p.items.forEach(function (item) {
                    var wrap = el('label', 'netcn-demo-check');
                    var cb = document.createElement('input');
                    cb.type = 'checkbox';
                    wrap.appendChild(cb);
                    wrap.appendChild(document.createTextNode(' ' + item));
                    demoArea.appendChild(wrap);
                    if (p.layout === 'vertical') demoArea.appendChild(document.createElement('br'));
                });
                break;

            case 'rad':
                var radWrap = el('label', 'netcn-demo-check');
                var radInput = document.createElement('input');
                radInput.type = 'radio';
                radInput.name = p.groupName;
                radInput.checked = p.checked;
                radWrap.appendChild(radInput);
                radWrap.appendChild(document.createTextNode(' ' + p.text));
                demoArea.appendChild(radWrap);
                break;

            case 'radlist':
                p.items.forEach(function (item, idx) {
                    var wrap = el('label', 'netcn-demo-check');
                    var rb = document.createElement('input');
                    rb.type = 'radio';
                    rb.name = 'netcn_radlist_' + ctrl.id;
                    rb.checked = (idx === p.selectedIndex);
                    wrap.appendChild(rb);
                    wrap.appendChild(document.createTextNode(' ' + item));
                    demoArea.appendChild(wrap);
                    if (p.layout === 'vertical') demoArea.appendChild(document.createElement('br'));
                });
                break;

            case 'ddl':
                var sel = el('select', 'netcn-demo-input');
                p.items.forEach(function (item, idx) {
                    var opt = document.createElement('option');
                    opt.textContent = item;
                    opt.selected = (idx === p.selectedIndex);
                    sel.appendChild(opt);
                });
                demoArea.appendChild(sel);
                break;

            case 'lst':
                var lst = el('select', 'netcn-demo-input');
                lst.multiple = p.multiple;
                lst.size = p.rows || 4;
                p.items.forEach(function (item) {
                    var opt = document.createElement('option');
                    opt.textContent = item;
                    lst.appendChild(opt);
                });
                demoArea.appendChild(lst);
                break;

            case 'lnk':
                var link = el('a', 'netcn-demo-link');
                link.href = p.url;
                link.target = p.target || '_blank';
                link.textContent = p.text;
                demoArea.appendChild(link);
                break;

            case 'img':
                var imgEl = el('img', 'netcn-demo-img');
                imgEl.src = p.src;
                imgEl.alt = p.alt;
                imgEl.style.width = p.width || '100%';
                demoArea.appendChild(imgEl);
                break;

            case 'fu':
                var fuZone = el('div', 'netcn-demo-upload');
                fuZone.innerHTML = '<p>📁 Drag files here or click to browse</p>';
                var fuInput = document.createElement('input');
                fuInput.type = 'file';
                fuInput.accept = p.accept;
                fuInput.multiple = p.multiple;
                fuInput.style.display = 'none';
                fuZone.addEventListener('click', function () { fuInput.click(); });
                fuZone.addEventListener('dragover', function (e) { e.preventDefault(); fuZone.classList.add('active'); });
                fuZone.addEventListener('dragleave', function () { fuZone.classList.remove('active'); });
                fuZone.addEventListener('drop', function (e) {
                    e.preventDefault();
                    fuZone.classList.remove('active');
                    fuZone.innerHTML = '<p>✔ ' + e.dataTransfer.files.length + ' file(s) selected</p>';
                });
                fuInput.addEventListener('change', function () {
                    fuZone.innerHTML = '<p>✔ ' + fuInput.files.length + ' file(s) selected</p>';
                });
                demoArea.appendChild(fuZone);
                demoArea.appendChild(fuInput);
                break;

            case 'cal':
                var calInput = el('input', 'netcn-demo-input');
                calInput.type = 'date';
                calInput.value = p.selectedDate || '';
                var calDisplay = el('div', 'netcn-cal-display');
                calDisplay.textContent = 'Select a date above';
                calInput.addEventListener('change', function () {
                    var d = new Date(calInput.value);
                    calDisplay.textContent = '📅 ' + d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                });
                demoArea.appendChild(calInput);
                demoArea.appendChild(calDisplay);
                break;

            case 'pnl':
                var panel = el('div', 'netcn-demo-panel');
                var panelHeader = el('div', 'netcn-panel-header');
                panelHeader.textContent = p.headerText;
                var panelBody = el('div', 'netcn-panel-body');
                panelBody.textContent = p.content;
                if (p.collapsed) panelBody.style.display = 'none';
                panelHeader.addEventListener('click', function () {
                    panelBody.style.display = panelBody.style.display === 'none' ? 'block' : 'none';
                });
                panel.appendChild(panelHeader);
                panel.appendChild(panelBody);
                demoArea.appendChild(panel);
                break;

            case 'bl':
                var ul = el(p.style === 'decimal' ? 'ol' : 'ul', 'netcn-demo-list');
                p.items.forEach(function (item) {
                    var li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                demoArea.appendChild(ul);
                break;

            default:
                demoArea.innerHTML = '<p>Preview not available.</p>';
        }

        demo.appendChild(demoArea);
        previewBody.appendChild(demo);
    }

    /* ================================================================
       STATE MANAGEMENT
       ================================================================ */
    function saveState(container, storageKey) {
        var zones = container.querySelectorAll('.netcn-zone');
        var cards = [];
        zones.forEach(function (zone) {
            var zoneId = zone.getAttribute('data-zone');
            var carEls = zone.querySelectorAll('.netcn-car');
            carEls.forEach(function (car) {
                cards.push({
                    id: car.id,
                    title: car.querySelector('.netcn-car-title').textContent,
                    col: zoneId,
                    color: getCarColor(car)
                });
            });
            var countEl = zone.querySelector('.netcn-count');
            if (countEl) countEl.textContent = carEls.length;
        });
        localStorage.setItem(storageKey, JSON.stringify({ cards: cards }));
    }

    function getCarColor(carEl) {
        for (var i = 0; i < CAR_COLORS.length; i++) {
            if (carEl.classList.contains('car-' + CAR_COLORS[i])) return CAR_COLORS[i];
        }
        return 'blue';
    }

    /* ================================================================
       ASP.NET PRACTICALS — Interactive Demos
       ================================================================ */
    function renderAspnetPracticals(container, toolId, config) {
        var board = el('div', 'netcn-controls-board');

        // Sidebar — practicals list
        var sidebar = el('div', 'netcn-controls-sidebar');
        var sideTitle = el('h4', 'netcn-sidebar-title');
        sideTitle.textContent = '📚 Practicals';
        sidebar.appendChild(sideTitle);

        // Preview area
        var preview = el('div', 'netcn-controls-preview');
        var previewBody = el('div', 'netcn-preview-body');
        preview.appendChild(previewBody);

        config.practicals.forEach(function (prac) {
            var item = el('div', 'netcn-control-item');
            item.textContent = prac.number + '. ' + prac.title;
            item.addEventListener('click', function () {
                sidebar.querySelectorAll('.netcn-control-item').forEach(function (i) { i.classList.remove('active'); });
                item.classList.add('active');
                renderPractical(previewBody, prac);
            });
            sidebar.appendChild(item);
        });

        board.appendChild(sidebar);
        board.appendChild(preview);
        container.appendChild(board);

        if (config.practicals.length > 0) {
            sidebar.querySelector('.netcn-control-item').classList.add('active');
            renderPractical(previewBody, config.practicals[0]);
        }
    }

    function renderPractical(previewBody, prac) {
        previewBody.innerHTML = '';

        // Info header
        var info = el('div', 'netcn-ctrl-info');
        var h3 = el('h3'); h3.textContent = 'Practical ' + prac.number + ': ' + prac.title;
        var desc = el('p'); desc.textContent = prac.description;
        var badge = el('span', 'netcn-ctrl-cat'); badge.textContent = 'Practical ' + prac.number;
        info.appendChild(h3); info.appendChild(desc); info.appendChild(badge);

        // Controls used
        if (prac.controls && prac.controls.length) {
            var ctrlBadges = el('div', 'netcn-prac-controls');
            prac.controls.forEach(function (c) {
                var b = el('span', 'netcn-prac-badge'); b.textContent = c; ctrlBadges.appendChild(b);
            });
            info.appendChild(ctrlBadges);
        }
        previewBody.appendChild(info);

        // C# Code
        if (prac.csharpCode) {
            var codeBlock = el('div', 'netcn-ctrl-demo');
            var codeLabel = el('div', 'netcn-demo-label'); codeLabel.textContent = 'C# Code (.aspx.cs)';
            var codeArea = el('pre', 'netcn-code-block'); codeArea.textContent = prac.csharpCode;
            codeBlock.appendChild(codeLabel); codeBlock.appendChild(codeArea);
            previewBody.appendChild(codeBlock);
        }

        // Live Demo
        var demo = el('div', 'netcn-ctrl-demo');
        var demoLabel = el('div', 'netcn-demo-label'); demoLabel.textContent = 'Live Demo — Try It!';
        demo.appendChild(demoLabel);
        var demoArea = el('div', 'netcn-demo-area');
        renderPracticalDemo(demoArea, prac);
        demo.appendChild(demoArea);
        previewBody.appendChild(demo);
    }

    function renderPracticalDemo(area, prac) {
        var resultLabel = el('div', 'netcn-prac-result');

        switch (prac.number) {
            case 1: // Hello World
            case 2: // Page Load
            case 3: // Label on Load
                resultLabel.textContent = 'Hello World';
                resultLabel.className = 'netcn-prac-result active';
                area.appendChild(resultLabel);
                break;

            case 4: // Button Click → Label
                var btn4 = el('button', 'netcn-demo-btn btn-primary'); btn4.textContent = 'Click Me';
                btn4.addEventListener('click', function () { resultLabel.textContent = 'Hello World'; resultLabel.className = 'netcn-prac-result active'; });
                area.appendChild(btn4); area.appendChild(resultLabel);
                break;

            case 5: // String Concatenation
                var t5a = el('input', 'netcn-demo-input'); t5a.placeholder = 'Enter String 1'; t5a.style.marginBottom = '8px';
                var t5b = el('input', 'netcn-demo-input'); t5b.placeholder = 'Enter String 2'; t5b.style.marginBottom = '8px';
                var b5 = el('button', 'netcn-demo-btn btn-primary'); b5.textContent = 'Concatenate';
                b5.addEventListener('click', function () { resultLabel.textContent = t5a.value + t5b.value; resultLabel.className = 'netcn-prac-result active'; });
                area.appendChild(t5a); area.appendChild(t5b); area.appendChild(b5); area.appendChild(resultLabel);
                break;

            case 6: // a^b
                var t6a = el('input', 'netcn-demo-input'); t6a.placeholder = 'Enter base (a)'; t6a.type = 'number'; t6a.style.marginBottom = '8px';
                var t6b = el('input', 'netcn-demo-input'); t6b.placeholder = 'Enter power (b)'; t6b.type = 'number'; t6b.style.marginBottom = '8px';
                var b6 = el('button', 'netcn-demo-btn btn-primary'); b6.textContent = 'Calculate a^b';
                b6.addEventListener('click', function () {
                    var a = parseFloat(t6a.value) || 0, b = parseFloat(t6b.value) || 0;
                    resultLabel.textContent = 'a ^ b = ' + Math.pow(a, b); resultLabel.className = 'netcn-prac-result active';
                });
                area.appendChild(t6a); area.appendChild(t6b); area.appendChild(b6); area.appendChild(resultLabel);
                break;

            case 7: // Marks Total & Average
                var mk = [];
                ['Subject 1', 'Subject 2', 'Subject 3'].forEach(function (s) {
                    var inp = el('input', 'netcn-demo-input'); inp.placeholder = s + ' marks'; inp.type = 'number'; inp.style.marginBottom = '8px';
                    mk.push(inp); area.appendChild(inp);
                });
                var b7 = el('button', 'netcn-demo-btn btn-primary'); b7.textContent = 'Calculate';
                var r7b = el('div', 'netcn-prac-result');
                b7.addEventListener('click', function () {
                    var vals = mk.map(function (i) { return parseFloat(i.value) || 0; });
                    var sum = vals.reduce(function (a, b) { return a + b; }, 0);
                    resultLabel.textContent = 'Total = ' + sum; resultLabel.className = 'netcn-prac-result active';
                    r7b.textContent = 'Average = ' + (sum / 3).toFixed(2); r7b.className = 'netcn-prac-result active';
                });
                area.appendChild(b7); area.appendChild(resultLabel); area.appendChild(r7b);
                break;

            case 8: // Feedback/Testimonial
                var fn = el('input', 'netcn-demo-input'); fn.placeholder = 'Your Name'; fn.style.marginBottom = '8px';
                var fe = el('input', 'netcn-demo-input'); fe.placeholder = 'Your Email'; fe.type = 'email'; fe.style.marginBottom = '8px';
                var ff = el('textarea', 'netcn-demo-input'); ff.placeholder = 'Your Feedback'; ff.rows = 3; ff.style.marginBottom = '8px';
                var b8 = el('button', 'netcn-demo-btn btn-primary'); b8.textContent = 'Submit Feedback';
                var testimonial = el('div', 'netcn-testimonial');
                b8.addEventListener('click', function () {
                    if (!fn.value || !ff.value) return;
                    testimonial.innerHTML = '';
                    var q = el('p', 'netcn-testi-quote'); q.textContent = '"' + ff.value + '"';
                    var n = el('p', 'netcn-testi-name'); n.textContent = '— ' + fn.value;
                    testimonial.appendChild(q); testimonial.appendChild(n);
                    testimonial.className = 'netcn-testimonial active';
                });
                area.appendChild(fn); area.appendChild(fe); area.appendChild(ff); area.appendChild(b8); area.appendChild(testimonial);
                break;

            case 9: // File Upload
                var fuZone = el('div', 'netcn-demo-upload');
                fuZone.innerHTML = '<p>📁 Drag files here or click to browse</p>';
                var fuInput = document.createElement('input'); fuInput.type = 'file'; fuInput.style.display = 'none';
                fuZone.addEventListener('click', function () { fuInput.click(); });
                fuZone.addEventListener('dragover', function (e) { e.preventDefault(); fuZone.classList.add('active'); });
                fuZone.addEventListener('dragleave', function () { fuZone.classList.remove('active'); });
                fuZone.addEventListener('drop', function (e) {
                    e.preventDefault(); fuZone.classList.remove('active');
                    resultLabel.textContent = '✔ ' + e.dataTransfer.files[0].name + ' selected (' + (e.dataTransfer.files[0].size / 1024).toFixed(1) + ' KB)';
                    resultLabel.className = 'netcn-prac-result active';
                });
                fuInput.addEventListener('change', function () {
                    if (fuInput.files.length) {
                        resultLabel.textContent = '✔ ' + fuInput.files[0].name + ' selected (' + (fuInput.files[0].size / 1024).toFixed(1) + ' KB)';
                        resultLabel.className = 'netcn-prac-result active';
                    }
                });
                area.appendChild(fuZone); area.appendChild(fuInput); area.appendChild(resultLabel);
                break;

            default:
                area.textContent = 'Demo not available.';
        }
    }

    /* ================================================================
       ASP.NET GENERATOR (Spring Initializr Style)
       ================================================================ */
    function renderAspnetGenerator(container, toolId, config) {
        var board = el('div', 'netcn-controls-board');

        // Sidebar — template list
        var sidebar = el('div', 'netcn-controls-sidebar');
        var sideTitle = el('h4', 'netcn-sidebar-title');
        sideTitle.textContent = '⚡ Templates';
        sidebar.appendChild(sideTitle);

        var preview = el('div', 'netcn-controls-preview');
        var previewBody = el('div', 'netcn-preview-body');
        preview.appendChild(previewBody);

        config.templates.forEach(function (tpl) {
            var item = el('div', 'netcn-control-item');
            item.textContent = tpl.name;
            item.addEventListener('click', function () {
                sidebar.querySelectorAll('.netcn-control-item').forEach(function (i) { i.classList.remove('active'); });
                item.classList.add('active');
                renderGeneratorTemplate(previewBody, tpl);
            });
            sidebar.appendChild(item);
        });

        board.appendChild(sidebar);
        board.appendChild(preview);
        container.appendChild(board);

        if (config.templates.length > 0) {
            sidebar.querySelector('.netcn-control-item').classList.add('active');
            renderGeneratorTemplate(previewBody, config.templates[0]);
        }
    }

    function renderGeneratorTemplate(previewBody, tpl) {
        previewBody.innerHTML = '';
        
        // State object to hold form values
        var formState = {};
        tpl.fields.forEach(function(f) { formState[f.id] = f.default; });

        var info = el('div', 'netcn-ctrl-info');
        var h3 = el('h3'); h3.textContent = tpl.name;
        var desc = el('p'); desc.textContent = tpl.description;
        info.appendChild(h3); info.appendChild(desc);
        previewBody.appendChild(info);

        var workArea = el('div', 'netcn-generator-workarea');
        workArea.style.display = 'flex';
        workArea.style.gap = '20px';
        workArea.style.marginTop = '20px';

        // Left col: Form configuration
        var formCol = el('div', 'netcn-gen-form');
        formCol.style.flex = '1';
        var fTitle = el('h4'); fTitle.textContent = 'Customize Project'; fTitle.style.marginBottom = '12px';
        formCol.appendChild(fTitle);

        var reRenderPreviews = function() {}; // forward declaration

        tpl.fields.forEach(function(f) {
            var label = el('label'); label.textContent = f.label; label.style.display = 'block'; label.style.marginBottom = '4px'; label.style.fontSize = '0.9rem'; label.style.color = '#8b949e';
            var inp = el('input', 'netcn-demo-input');
            inp.value = f.default;
            inp.style.marginBottom = '16px';
            inp.addEventListener('input', function() {
                formState[f.id] = inp.value;
                reRenderPreviews();
            });
            formCol.appendChild(label);
            formCol.appendChild(inp);
        });

        // Download button
        var dlBtn = el('button', 'netcn-demo-btn btn-primary');
        dlBtn.textContent = '⬇️ Generate Project (.zip)';
        dlBtn.style.width = '100%';
        dlBtn.style.padding = '12px';
        dlBtn.style.fontSize = '1rem';
        dlBtn.addEventListener('click', function() {
            downloadZip(tpl, formState);
        });
        formCol.appendChild(dlBtn);

        // Right col: Code previews
        var codeCol = el('div', 'netcn-gen-code');
        codeCol.style.flex = '2';
        codeCol.style.minWidth = '0';

        var aspxTitle = el('div', 'netcn-demo-label'); aspxTitle.textContent = 'Default.aspx';
        var aspxPre = el('pre', 'netcn-code-block');
        
        var csTitle = el('div', 'netcn-demo-label'); csTitle.textContent = 'Default.aspx.cs'; csTitle.style.marginTop = '20px';
        var csPre = el('pre', 'netcn-code-block');

        codeCol.appendChild(aspxTitle); codeCol.appendChild(aspxPre);
        codeCol.appendChild(csTitle); codeCol.appendChild(csPre);

        workArea.appendChild(formCol);
        workArea.appendChild(codeCol);
        previewBody.appendChild(workArea);

        // Render template with replacements
        reRenderPreviews = function() {
            var getFile = function(filename) {
                var content = tpl.files[filename] || '';
                Object.keys(formState).forEach(function(k) {
                    content = content.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), formState[k]);
                });
                return content;
            };
            aspxPre.textContent = getFile('Default.aspx');
            csPre.textContent = getFile('Default.aspx.cs');
        };

        reRenderPreviews();
    }

    function downloadZip(tpl, formState) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library not loaded yet. Please wait a moment.');
            return;
        }

        var zip = new JSZip();
        var folderName = tpl.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        var folder = zip.folder(folderName);

        Object.keys(tpl.files).forEach(function(filename) {
            var content = tpl.files[filename];
            Object.keys(formState).forEach(function(k) {
                content = content.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), formState[k]);
            });
            folder.file(filename, content);
        });

        zip.generateAsync({type:"blob"}).then(function(content) {
            var link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = folderName + '.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    /* ================================================================
       HELPERS
       ================================================================ */
    function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
    function esc(str) { var d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }

})();
