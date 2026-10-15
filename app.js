/* ==========================================================
   Essência • Controle de Estoque de Perfumaria
   JavaScript puro (sem dependências) + localStorage
   ========================================================== */
(() => {
  'use strict';

  /* ---------- Constantes ---------- */
  const STORAGE_KEY = 'perfumaria.estoque.v1';
  const THEME_KEY = 'perfumaria.tema';
  const CATEGORIES = ['Masculino', 'Feminino', 'Unissex', 'Infantil', 'Body Splash', 'Cosméticos', 'Outros'];
  const CATEGORY_ICONS = {
    Masculino: '🧴', Feminino: '🌸', Unissex: '✨', Infantil: '🧸',
    'Body Splash': '💧', Cosméticos: '💄', Outros: '🎁'
  };

  /* ---------- Utilitários ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const num = new Intl.NumberFormat('pt-BR');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const fmtDate = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  /* ---------- Estado ---------- */
  let state = load();

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && Array.isArray(data.products) && Array.isArray(data.movements)) return data;
    } catch (e) { /* ignora */ }
    return { products: [], movements: [] };
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { toast('Não foi possível salvar os dados no navegador.', 'error'); }
  }

  const getProduct = (id) => state.products.find((p) => p.id === id);

  function statusOf(p) {
    if (p.qty <= 0) return 'out';
    if (p.qty <= p.min) return 'low';
    return 'ok';
  }

  /* ---------- Tema ---------- */
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignora */ }
  }
  $('#btnTheme').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* ---------- Toast ---------- */
  function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = (type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : '') + msg;
    $('#toasts').appendChild(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  /* ---------- Abas ---------- */
  $$('.tab').forEach((btn) => btn.addEventListener('click', () => {
    $$('.tab').forEach((b) => b.classList.toggle('is-active', b === btn));
    $('#tab-estoque').hidden = btn.dataset.tab !== 'estoque';
    $('#tab-historico').hidden = btn.dataset.tab !== 'historico';
  }));

  /* ---------- Selects de categoria ---------- */
  function fillCategorySelects() {
    $('#pCategory').innerHTML = CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');
    $('#filterCategory').innerHTML = '<option value="">Todas as categorias</option>' +
      CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');
  }

  /* ---------- Renderização ---------- */
  function render() {
    renderStats();
    renderProducts();
    renderMovements();
  }

  function renderStats() {
    const products = state.products;
    $('#statProducts').textContent = num.format(products.length);
    $('#statUnits').textContent = num.format(products.reduce((s, p) => s + p.qty, 0));
    $('#statValue').textContent = brl.format(products.reduce((s, p) => s + p.qty * p.price, 0));
    $('#statLow').textContent = num.format(products.filter((p) => statusOf(p) !== 'ok').length);
  }

  function filteredProducts() {
    const q = norm($('#searchProducts').value.trim());
    const cat = $('#filterCategory').value;
    const status = $('#filterStatus').value;
    const sort = $('#sortProducts').value;

    let list = state.products.filter((p) => {
      if (q && !norm(p.name + ' ' + p.brand).includes(q)) return false;
      if (cat && p.category !== cat) return false;
      if (status && statusOf(p) !== status) return false;
      return true;
    });

    const sorters = {
      name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      qtyAsc: (a, b) => a.qty - b.qty,
      qtyDesc: (a, b) => b.qty - a.qty,
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price
    };
    return list.sort(sorters[sort]);
  }

  function renderProducts() {
    const list = filteredProducts();
    const grid = $('#productGrid');
    const empty = $('#emptyProducts');

    grid.innerHTML = list.map(cardHTML).join('');
    empty.hidden = list.length > 0;

    if (!list.length) {
      const hasAny = state.products.length > 0;
      $('h3', empty).textContent = hasAny ? 'Nenhum produto encontrado' : 'Seu estoque está vazio';
      $('p', empty).textContent = hasAny
        ? 'Tente ajustar a busca ou os filtros.'
        : 'Cadastre seu primeiro perfume ou carregue alguns exemplos para testar o sistema.';
      $('#btnSeed').hidden = hasAny;
      $('#btnAddEmpty').hidden = hasAny ? true : false;
    }
  }

  function cardHTML(p) {
    const st = statusOf(p);
    const labels = { ok: 'Em estoque', low: 'Estoque baixo', out: 'Esgotado' };
    const target = Math.max(p.min * 3, 1);
    const pct = Math.min(100, Math.round((p.qty / target) * 100));
    const profit = p.price - p.cost;
    const fillClass = st === 'ok' ? '' : st === 'low' ? 'bar__fill--low' : 'bar__fill--out';

    return `
      <article class="card" data-id="${p.id}">
        <div class="card__top">
          <div class="card__avatar">${CATEGORY_ICONS[p.category] || '🧴'}</div>
          <div>
            <h3 class="card__title">${esc(p.name)}</h3>
            <p class="card__brand">${esc(p.brand)}${p.size ? ' • ' + esc(p.size) + ' ml' : ''}</p>
            <span class="chip">${esc(p.category)}</span>
          </div>
          <span class="badge badge--${st} card__badge">${labels[st]}</span>
        </div>

        <div class="card__info">
          <div class="info"><p class="info__label">Venda</p><p class="info__value info__value--gold">${brl.format(p.price)}</p></div>
          <div class="info"><p class="info__label">Custo</p><p class="info__value">${brl.format(p.cost)}</p></div>
          <div class="info"><p class="info__label">Lucro unit.</p><p class="info__value">${brl.format(profit)}</p></div>
          <div class="info"><p class="info__label">Valor em estoque</p><p class="info__value">${brl.format(p.qty * p.price)}</p></div>
        </div>

        <div class="stock">
          <div class="stock__row"><span>Em estoque</span><span><strong>${num.format(p.qty)}</strong> un. <span class="muted">(mín. ${num.format(p.min)})</span></span></div>
          <div class="bar"><div class="bar__fill ${fillClass}" style="width:${pct}%"></div></div>
        </div>

        <div class="card__actions">
          <button class="btn btn--sm btn--in" data-action="in" data-id="${p.id}">⬇ Entrada</button>
          <button class="btn btn--sm btn--out" data-action="out" data-id="${p.id}">⬆ Saída</button>
          <div class="card__more">
            <button class="btn btn--sm btn--ghost" data-action="edit" data-id="${p.id}">✎ Editar</button>
            <button class="btn btn--sm btn--ghost" data-action="delete" data-id="${p.id}">🗑 Excluir</button>
          </div>
        </div>
      </article>`;
  }

  function renderMovements() {
    const q = norm($('#searchMoves').value.trim());
    const type = $('#filterMoveType').value;
    const list = state.movements
      .filter((m) => (!type || m.type === type) && (!q || norm(m.productName + ' ' + (m.note || '')).includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date));

    $('#movesBody').innerHTML = list.map((m) => `
      <tr>
        <td class="muted">${fmtDate(m.date)}</td>
        <td><strong>${esc(m.productName)}</strong></td>
        <td><span class="badge ${m.type === 'in' ? 'badge--in' : 'badge--outm'}">${m.type === 'in' ? '⬇ Entrada' : '⬆ Saída'}</span></td>
        <td class="num">${m.type === 'in' ? '+' : '−'}${num.format(m.qty)}</td>
        <td class="num">${brl.format(m.qty * m.unitValue)}</td>
        <td class="muted">${esc(m.note || '—')}</td>
      </tr>`).join('');

    $('#emptyMoves').hidden = list.length > 0;
    $('.table-wrap').hidden = list.length === 0;
  }

  /* ---------- Modais (utilidades) ---------- */
  $$('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) e.target.closest('dialog').close();
  });

  const showError = (el, msg) => { el.textContent = msg; el.hidden = false; };

  /* ---------- Produto: adicionar / editar ---------- */
  function openProductDialog(id) {
    const p = id ? getProduct(id) : null;
    $('#dlgProductTitle').textContent = p ? 'Editar produto' : 'Novo produto';
    $('#pError').hidden = true;

    $('#pId').value = p?.id || '';
    $('#pName').value = p?.name || '';
    $('#pBrand').value = p?.brand || '';
    $('#pCategory').value = p?.category || CATEGORIES[0];
    $('#pSize').value = p?.size ?? '';
    $('#pMin').value = p?.min ?? 3;
    $('#pCost').value = p?.cost ?? '';
    $('#pPrice').value = p?.price ?? '';
    $('#pQty').value = p?.qty ?? 0;

    // Ao editar, a quantidade só muda por entrada/saída (mantém o histórico fiel)
    $('#pQty').disabled = !!p;
    $('#pQtyHint').textContent = p
      ? 'Para alterar a quantidade, use os botões Entrada e Saída.'
      : 'Se informar uma quantidade inicial, ela será registrada como entrada.';

    $('#dlgProduct').showModal();
    $('#pName').focus();
  }

  $('#formProduct').addEventListener('submit', (e) => {
    e.preventDefault();
    const errEl = $('#pError');
    errEl.hidden = true;

    const id = $('#pId').value;
    const name = $('#pName').value.trim();
    const brand = $('#pBrand').value.trim();
    const cost = parseFloat($('#pCost').value);
    const price = parseFloat($('#pPrice').value);
    const qty = parseInt($('#pQty').value, 10) || 0;
    const min = parseInt($('#pMin').value, 10) || 0;
    const size = parseInt($('#pSize').value, 10) || 0;

    if (!name) return showError(errEl, 'Informe o nome do perfume.');
    if (!brand) return showError(errEl, 'Informe a marca.');
    if (isNaN(cost) || cost < 0) return showError(errEl, 'Informe um preço de custo válido.');
    if (isNaN(price) || price < 0) return showError(errEl, 'Informe um preço de venda válido.');
    if (qty < 0 || min < 0) return showError(errEl, 'Quantidade e estoque mínimo não podem ser negativos.');

    const data = { name, brand, category: $('#pCategory').value, size, min, cost, price };

    if (id) {
      Object.assign(getProduct(id), data);
      toast('Produto atualizado!');
    } else {
      const product = { id: uid(), ...data, qty: 0, createdAt: new Date().toISOString() };
      state.products.push(product);
      if (qty > 0) applyMovement(product, 'in', qty, cost, 'Estoque inicial');
      toast('Produto cadastrado!');
    }

    save();
    $('#dlgProduct').close();
    render();
  });

  /* ---------- Exclusão ---------- */
  let pendingDeleteId = null;

  function askDelete(id) {
    const p = getProduct(id);
    if (!p) return;
    pendingDeleteId = id;
    $('#confirmText').textContent = `"${p.name}" será removido do estoque. O histórico de movimentações será mantido. Esta ação não pode ser desfeita.`;
    $('#dlgConfirm').showModal();
  }

  $('#btnConfirmDelete').addEventListener('click', () => {
    if (!pendingDeleteId) return;
    state.products = state.products.filter((p) => p.id !== pendingDeleteId);
    pendingDeleteId = null;
    save();
    $('#dlgConfirm').close();
    render();
    toast('Produto excluído.');
  });

  /* ---------- Movimentações ---------- */
  function applyMovement(product, type, qty, unitValue, note) {
    product.qty += type === 'in' ? qty : -qty;
    state.movements.push({
      id: uid(),
      productId: product.id,
      productName: product.name,
      type, qty, unitValue,
      note: note || '',
      date: new Date().toISOString()
    });
  }

  function openMoveDialog(id, type) {
    const p = getProduct(id);
    if (!p) return;
    $('#mError').hidden = true;
    $('#mId').value = id;
    $('#mProduct').textContent = `${p.name} — ${p.brand}`;
    $(`input[name="mType"][value="${type}"]`).checked = true;
    $('#mQty').value = 1;
    $('#mNote').value = '';
    syncMoveUnit();
    $('#dlgMove').showModal();
    $('#mQty').select();
  }

  function syncMoveUnit() {
    const p = getProduct($('#mId').value);
    if (!p) return;
    const type = $('input[name="mType"]:checked').value;
    $('#mUnit').value = type === 'in' ? p.cost : p.price;
    $('#mHint').textContent = `Estoque atual: ${num.format(p.qty)} un. ` +
      (type === 'in' ? '(valor sugerido: preço de custo)' : '(valor sugerido: preço de venda)');
  }

  $$('input[name="mType"]').forEach((r) => r.addEventListener('change', syncMoveUnit));

  $('#formMove').addEventListener('submit', (e) => {
    e.preventDefault();
    const errEl = $('#mError');
    errEl.hidden = true;

    const p = getProduct($('#mId').value);
    const type = $('input[name="mType"]:checked').value;
    const qty = parseInt($('#mQty').value, 10);
    const unit = parseFloat($('#mUnit').value);

    if (!p) return;
    if (!qty || qty < 1) return showError(errEl, 'Informe uma quantidade válida.');
    if (type === 'out' && qty > p.qty) return showError(errEl, `Estoque insuficiente. Disponível: ${p.qty} un.`);

    applyMovement(p, type, qty, isNaN(unit) ? (type === 'in' ? p.cost : p.price) : unit, $('#mNote').value.trim());
    save();
    $('#dlgMove').close();
    render();
    toast(type === 'in' ? `Entrada de ${qty} un. registrada.` : `Saída de ${qty} un. registrada.`);
  });

  /* ---------- Eventos da grade de produtos ---------- */
  $('#productGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'edit') openProductDialog(id);
    else if (action === 'delete') askDelete(id);
    else if (action === 'in' || action === 'out') openMoveDialog(id, action);
  });

  /* ---------- Filtros ---------- */
  ['#searchProducts', '#filterCategory', '#filterStatus', '#sortProducts'].forEach((s) => {
    $(s).addEventListener('input', renderProducts);
  });
  ['#searchMoves', '#filterMoveType'].forEach((s) => $(s).addEventListener('input', renderMovements));

  /* ---------- Botões principais ---------- */
  $('#btnAdd').addEventListener('click', () => openProductDialog());
  $('#btnAddEmpty').addEventListener('click', () => openProductDialog());
  $('#btnExport').addEventListener('click', () => $('#dlgData').showModal());

  /* ---------- Exemplos ---------- */
  $('#btnSeed').addEventListener('click', () => {
    const samples = [
      ['Sauvage Eau de Parfum', 'Dior', 'Masculino', 100, 520, 790, 8, 3],
      ['Good Girl', 'Carolina Herrera', 'Feminino', 80, 480, 720, 2, 3],
      ['CK One', 'Calvin Klein', 'Unissex', 100, 210, 349, 12, 4],
      ['Malbec', 'O Boticário', 'Masculino', 100, 115, 189, 15, 5],
      ['Floratta Rose', 'O Boticário', 'Feminino', 75, 70, 129, 0, 4],
      ['Body Splash Vanilla', 'Bath & Body Works', 'Body Splash', 236, 55, 99, 20, 6]
    ];
    samples.forEach(([name, brand, category, size, cost, price, qty, min]) => {
      const p = { id: uid(), name, brand, category, size, cost, price, min, qty: 0, createdAt: new Date().toISOString() };
      state.products.push(p);
      if (qty > 0) applyMovement(p, 'in', qty, cost, 'Estoque inicial');
    });
    save();
    render();
    toast('Exemplos carregados!');
  });

  /* ---------- Exportar / Importar ---------- */
  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const stamp = () => new Date().toISOString().slice(0, 10);

  $('#btnCsv').addEventListener('click', () => {
    if (!state.products.length) return toast('Não há produtos para exportar.', 'error');
    const header = ['Nome', 'Marca', 'Categoria', 'Volume (ml)', 'Custo', 'Venda', 'Quantidade', 'Estoque mínimo', 'Valor em estoque'];
    const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = state.products.map((p) =>
      [p.name, p.brand, p.category, p.size, p.cost.toFixed(2).replace('.', ','), p.price.toFixed(2).replace('.', ','), p.qty, p.min, (p.qty * p.price).toFixed(2).replace('.', ',')].map(cell).join(';'));
    download(`estoque-perfumaria-${stamp()}.csv`, '\uFEFF' + [header.map(cell).join(';'), ...rows].join('\r\n'), 'text/csv;charset=utf-8');
    toast('CSV exportado!');
  });

  $('#btnJson').addEventListener('click', () => {
    download(`backup-perfumaria-${stamp()}.json`, JSON.stringify(state, null, 2), 'application/json');
    toast('Backup gerado!');
  });

  $('#fileImport').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.products) || !Array.isArray(data.movements)) throw new Error();
        if (!confirm('Importar este backup substituirá todos os dados atuais. Continuar?')) return;
        state = { products: data.products, movements: data.movements };
        save();
        render();
        $('#dlgData').close();
        toast('Backup importado com sucesso!');
      } catch (err) {
        toast('Arquivo inválido. Use um backup JSON gerado pelo sistema.', 'error');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  $('#btnReset').addEventListener('click', () => {
    if (!confirm('Apagar TODOS os produtos e movimentações? Esta ação não pode ser desfeita.')) return;
    state = { products: [], movements: [] };
    save();
    render();
    $('#dlgData').close();
    toast('Todos os dados foram apagados.');
  });

  /* ---------- Início ---------- */
  fillCategorySelects();
  render();
})();
