/**
 * 渲染层补丁：自选股表格「首列拖拽排序」。
 *
 * 背景：渲染层（Vue 3）原始源码已丢失，无法直接改其源码，只能通过
 * scripts/inject-renderer.mjs 把本脚本「幂等注入」到打包后的 index.html
 * （在 Vue 应用挂载之后执行）。因此本文件是「外挂增强」，只在运行时操作 DOM，
 * 不依赖 Vue 内部实现，靠 Element Plus 表格的固定 class 选择器工作。
 *
 * 工作原理：
 *   1. 只在「股票名」首列按下时，才给该行设置 draggable=true（避免与按钮/右键菜单/
 *      文本选择冲突）
 *   2. 利用 HTML5 原生 Drag & Drop：dragstart 记录拖拽行，dragover 依据「光标在目标
 *      行上半还是下半」动态显示蓝色插入线（上/下），drop 时算出目标位置并调用后端
 *   3. 通过 ipc 两个通道完成持久化：
 *        - config 'get'                 → 读取当前自选股 keys 与别名 alias
 *        - api 'sortKeys' {from,to,after} → 通知主进程调整顺序并保存
 *   4. 用「显示的股票名文本」反查 key（因为拖拽拿到的只有 DOM 文本，没有 key），
 *      优先匹配别名，其次匹配原名。
 */
/* 自选股拖拽排序：仅“股票名”第一列可作为拖拽手柄 */
(function () {
  var req = window.require || (typeof require !== 'undefined' ? require : null);
  if (!req) return;
  var ipc;
  try { ipc = req('electron').ipcRenderer; } catch (e) { return; }

  var dragRow = null, indicator = null;

  function tableEl() { return document.getElementById('mainTable'); }
  function bodyRows() {
    var t = tableEl();
    return t ? Array.prototype.slice.call(t.querySelectorAll('.el-table__body-wrapper tbody tr.el-table__row')) : [];
  }
  function nameCell(row) { return row ? row.querySelector('td:first-child') : null; }
  function clearIndicator() {
    var t = tableEl();
    if (t) Array.prototype.forEach.call(t.querySelectorAll('.sm-drop-before,.sm-drop-after'),
      function (r) { r.classList.remove('sm-drop-before', 'sm-drop-after'); });
    indicator = null;
  }
  function endDrag() {
    if (dragRow) {
      dragRow.classList.remove('sm-dragging');
      dragRow.removeAttribute('draggable');
      dragRow = null;
    }
    clearIndicator();
  }

  /* 仅在按下“股票名”首列时才允许该行发起拖拽，避免与按钮/右键菜单/文本选择冲突 */
  document.addEventListener('mousedown', function (e) {
    var t = tableEl();
    if (!t || !e.target.closest) return;
    var cell = e.target.closest('td');
    if (!cell || !t.contains(cell)) return;
    if (cell.parentNode.querySelector('td:first-child') !== cell) return;
    var row = cell.closest('tr.el-table__row');
    if (row) row.setAttribute('draggable', 'true');
  }, true);
  document.addEventListener('mouseup', function () {
    bodyRows().forEach(function (r) {
      if (!r.classList.contains('sm-dragging')) r.removeAttribute('draggable');
    });
  }, true);

  document.addEventListener('dragstart', function (e) {
    if (!e.target.closest || !tableEl()) return;
    var row = e.target.closest('tr.el-table__row');
    if (!row || !tableEl().contains(row)) return;
    dragRow = row;
    row.classList.add('sm-dragging');
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', 'sm-reorder'); } catch (_) {}
    }
  });
  document.addEventListener('dragover', function (e) {
    if (!dragRow || !e.target.closest) return;
    var row = e.target.closest('tr.el-table__row');
    if (!row || row === dragRow || !tableEl().contains(row)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    var rect = row.getBoundingClientRect();
    var after = e.clientY > rect.top + rect.height / 2;
    if (indicator !== row || indicator._smAfter !== after) {
      clearIndicator();
      row.classList.add(after ? 'sm-drop-after' : 'sm-drop-before');
      indicator = row;
      indicator._smAfter = after;
    }
  });
  document.addEventListener('drop', function (e) {
    if (!dragRow || !e.target.closest) { endDrag(); return; }
    var row = e.target.closest('tr.el-table__row');
    if (row && row !== dragRow && tableEl().contains(row)) {
      e.preventDefault();
      var rect = row.getBoundingClientRect();
      var after = e.clientY > rect.top + rect.height / 2;
      var fromText = nameCell(dragRow) ? nameCell(dragRow).textContent.trim() : '';
      var toText = nameCell(row) ? nameCell(row).textContent.trim() : '';
      reorder(fromText, toText, after);
    }
    endDrag();
  });
  document.addEventListener('dragend', endDrag);

  async function reorder(fromText, toText, after) {
    try {
      // 读取当前自选股配置（keys 顺序 + alias 别名），用于文本 -> key 的反查
      var cfg = await ipc.invoke('config', 'get');
      var keys = (cfg && cfg.keys) || [];
      var alias = (cfg && cfg.alias) || {};
      // 把「单元格里显示的文本」还原成唯一 key：优先别名、其次原名
      function keyOf(text) {
        if (!text) return null;
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          var disp = alias[k.key] || k.name;
          if (disp && (text === disp || text.indexOf(disp) >= 0)) return k.key;
        }
        return null;
      }
      var fromKey = keyOf(fromText), toKey = keyOf(toText);
      // 有效、且起点终点不同才真正下发；after=true 表示插入到目标行之后
      if (fromKey && toKey && fromKey !== toKey) {
        await ipc.invoke('api', 'sortKeys', { from: fromKey, to: toKey, after: !!after });
      }
    } catch (err) {
      console.log('sortKeys error:', err);
    }
  }

  // 拖拽所需的最小 CSS：首列鼠标为 move、拖拽行半透明、插入线（上/下蓝线）样式
  var style = document.createElement('style');
  style.textContent =
    '#mainTable .el-table__row td:first-child{cursor:move}' +
    '#mainTable .sm-dragging{opacity:.35}' +
    '#mainTable .sm-drop-before td{box-shadow:inset 0 2px 0 0 #238CF7}' +
    '#mainTable .sm-drop-after td{box-shadow:inset 0 -2px 0 0 #238CF7}';
  document.head.appendChild(style);
})();
