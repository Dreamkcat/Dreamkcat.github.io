const STORAGE_KEY = 'video-storyboard-data';
let rows = [];
let saveTimer = null;
let serverAvailable = null;

function createEmptyRow(order, copy) {
  return {
    id: Date.now() + Math.random(),
    order: order || '',
    image: '',
    shotType: '',
    movement: '',
    content: '',
    copy: copy || '',
    sound: '',
    remark: ''
  };
}

function getDefaultRows() {
  return [createEmptyRow('1'), createEmptyRow('2'), createEmptyRow('3')];
}

function resetProject() {
  if (!confirm('\u786e\u5b9a\u8981\u91cd\u7f6e\u5417\uff1f\u6240\u6709\u5185\u5bb9\u5c06\u6062\u590d\u4e3a\u9ed8\u8ba4\u72b6\u6001\uff0c\u6b64\u64cd\u4f5c\u4e0d\u53ef\u64a4\u9500\u3002')) return;
  document.getElementById('videoTitle').value = '';
  document.getElementById('videoIntro').value = '';
  rows = getDefaultRows();
  renderTable();
  localStorage.removeItem(STORAGE_KEY);
  document.getElementById('saveHint').textContent = '\u5df2\u91cd\u7f6e\u4e3a\u9ed8\u8ba4\u72b6\u6001 \u00b7 ' + new Date().toLocaleTimeString();
}

function sanitizeFilename(name) {
  const cleaned = (name || '').trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .slice(0, 80);
  return cleaned || '\u672a\u547d\u540d\u5206\u955c';
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.max(80, el.scrollHeight) + 'px';
}

function renderTable(options = {}) {
  const tbody = document.getElementById('shotTable');
  const wrapper = document.querySelector('.table-wrapper');
  const scrollTop = wrapper ? wrapper.scrollTop : 0;
  const scrollLeft = wrapper ? wrapper.scrollLeft : 0;

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-state">\u6682\u65e0\u955c\u5934\uff0c\u70b9\u51fb\u300c\u6dfb\u52a0\u955c\u5934\u300d\u5f00\u59cb\u7f16\u5199\u811a\u672c</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((row, index) => `
    <tr data-id="${row.id}">
      <td>
        <textarea class="cell-input order-input" rows="1" data-index="${index}" data-field="order" placeholder="${index + 1}">${esc(row.order)}</textarea>
      </td>
      <td>
        <div class="image-cell">
          <div class="image-preview" data-upload="${index}" title="\u70b9\u51fb\u4e0a\u4f20\u56fe\u7247">
            ${row.image ? `<img src="${row.image}" alt="\u5206\u955c">` : '<span class="placeholder">\u70b9\u51fb\u4e0a\u4f20<br>\u5206\u955c\u56fe\u7247</span>'}
          </div>
          <div class="image-actions">
            <button type="button" class="btn-sm" data-upload="${index}">\u4e0a\u4f20</button>
            ${row.image ? `<button type="button" class="btn-sm" data-clear-image="${index}">\u6e05\u9664</button>` : ''}
          </div>
          <input type="file" class="hidden-input" id="file-${index}" accept="image/*" data-file="${index}">
        </div>
      </td>
      <td><textarea class="cell-input short" data-index="${index}" data-field="shotType" placeholder="\u5982\uff1a\u4e2d\u666f">${esc(row.shotType)}</textarea></td>
      <td><textarea class="cell-input short" data-index="${index}" data-field="movement" placeholder="\u5982\uff1a\u56fa\u5b9a">${esc(row.movement)}</textarea></td>
      <td><textarea class="cell-input" data-index="${index}" data-field="content" placeholder="\u63cf\u8ff0\u753b\u9762\u5185\u5bb9...">${esc(row.content)}</textarea></td>
      <td><textarea class="cell-input" data-index="${index}" data-field="copy" placeholder="\u65c1\u767d\u6216\u53f0\u8bcd...">${esc(row.copy)}</textarea></td>
      <td><textarea class="cell-input short" data-index="${index}" data-field="sound" placeholder="\u80cc\u666f\u97f3\u4e50/\u97f3\u6548...">${esc(row.sound)}</textarea></td>
      <td><textarea class="cell-input short" data-index="${index}" data-field="remark" placeholder="\u5907\u6ce8...">${esc(row.remark)}</textarea></td>
      <td class="col-action">
        <div class="row-actions">
          <button type="button" class="btn btn-add" data-insert="${index}" title="\u5728\u6b64\u884c\u4e0b\u65b9\u6dfb\u52a0\u955c\u5934">+</button>
          <button type="button" class="btn btn-danger" data-delete="${index}">\u5220\u9664</button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('textarea').forEach(autoResize);

  if (wrapper) {
    if (options.scrollToIndex !== undefined) {
      const targetRow = tbody.querySelector(`tr[data-id="${rows[options.scrollToIndex]?.id}"]`);
      if (targetRow) {
        targetRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        wrapper.scrollTop = scrollTop;
        wrapper.scrollLeft = scrollLeft;
      }
    } else {
      wrapper.scrollTop = scrollTop;
      wrapper.scrollLeft = scrollLeft;
    }
  }

  if (options.focusIndex !== undefined) {
    const field = options.focusField || 'copy';
    const el = tbody.querySelector(`textarea[data-index="${options.focusIndex}"][data-field="${field}"]`);
    if (el) el.focus();
  }
}

function updateField(index, field, value) {
  rows[index][field] = value;
  autoSave();
}

function addRow() {
  const newIndex = rows.length;
  rows.push(createEmptyRow(String(newIndex + 1)));
  renderTable({ scrollToIndex: newIndex, focusIndex: newIndex });
  autoSave();
}

function insertRowAfter(index) {
  const newRow = createEmptyRow('');
  rows.splice(index + 1, 0, newRow);
  renderTable({ scrollToIndex: index + 1, focusIndex: index + 1 });
  autoSave();
}

function deleteRow(index) {
  if (rows.length === 0) return;
  if (rows.length === 1 || confirm('\u786e\u5b9a\u5220\u9664\u7b2c ' + (index + 1) + ' \u4e2a\u955c\u5934\u5417\uff1f')) {
    rows.splice(index, 1);
    renderTable();
    autoSave();
  }
}

function renumberRows() {
  rows.forEach((row, i) => { row.order = String(i + 1); });
  renderTable();
  autoSave();
}

function triggerUpload(index) {
  document.getElementById('file-' + index).click();
}

function uploadImage(index, file) {
  if (!file || !file.type.startsWith('image/')) {
    alert('\u8bf7\u9009\u62e9\u56fe\u7247\u6587\u4ef6');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    rows[index].image = e.target.result;
    renderTable();
    autoSave();
  };
  reader.readAsDataURL(file);
}

function removeImage(index) {
  rows[index].image = '';
  renderTable();
  autoSave();
}

function getProjectData() {
  return {
    version: 1,
    title: document.getElementById('videoTitle').value,
    intro: document.getElementById('videoIntro').value,
    rows,
    savedAt: new Date().toISOString()
  };
}

function applyProjectData(data) {
  document.getElementById('videoTitle').value = data.title || '';
  document.getElementById('videoIntro').value = data.intro || '';
  rows = (data.rows || []).map(r => ({ ...createEmptyRow(), ...r, id: r.id || Date.now() + Math.random() }));
  renderTable();
}

function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getProjectData()));
      document.getElementById('saveHint').textContent = '\u5df2\u81ea\u52a8\u4fdd\u5b58 \u00b7 ' + new Date().toLocaleTimeString();
    } catch (e) {
      document.getElementById('saveHint').textContent = '\u81ea\u52a8\u4fdd\u5b58\u5931\u8d25\uff08\u56fe\u7247\u8fc7\u591a\u8bf7\u7528\u300c\u4fdd\u5b58\u9879\u76ee\u300d\u5bfc\u51fa\u6587\u4ef6\uff09';
    }
  }, 500);
}

async function checkServerAvailable() {
  if (serverAvailable !== null) return serverAvailable;
  try {
    const res = await fetch('/api/status', { cache: 'no-store' });
    if (!res.ok) throw new Error('status failed');
    const info = await res.json();
    serverAvailable = !!(info.ok && info.scriptsDirExists);
  } catch (e) {
    serverAvailable = false;
  }
  return serverAvailable;
}

async function saveProject() {
  const data = getProjectData();
  const filename = sanitizeFilename(data.title) + '.json';

  if (await checkServerAvailable()) {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, project: data })
      });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error || 'save failed');
      document.getElementById('saveHint').textContent = '\u5df2\u4fdd\u5b58\u5230\u811a\u672c\u6587\u4ef6\u5939\uff1a\u300c' + result.filename + '\u300d \u00b7 ' + new Date().toLocaleTimeString();
      return;
    } catch (e) {
      document.getElementById('saveHint').textContent = '\u4fdd\u5b58\u5230\u811a\u672c\u6587\u4ef6\u5939\u5931\u8d25\uff0c\u6539\u4e3a\u4e0b\u8f7d\u6587\u4ef6';
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  document.getElementById('saveHint').textContent = '\u5df2\u4fdd\u5b58\u4e3a\u300c' + filename + '\u300d \u00b7 ' + new Date().toLocaleTimeString();
}

function loadProject(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      applyProjectData(JSON.parse(e.target.result));
      autoSave();
      document.getElementById('saveHint').textContent = '\u9879\u76ee\u5df2\u52a0\u8f7d \u00b7 ' + new Date().toLocaleTimeString();
    } catch (err) {
      alert('\u6587\u4ef6\u683c\u5f0f\u9519\u8bef\uff0c\u65e0\u6cd5\u52a0\u8f7d');
    }
  };
  reader.readAsText(file);
}

async function extractDocxParagraphs(arrayBuffer) {
  if (typeof JSZip === 'undefined') {
    throw new Error('JSZip not loaded');
  }
  const zip = await JSZip.loadAsync(arrayBuffer);
  const xmlFile = zip.file('word/document.xml');
  if (!xmlFile) {
    throw new Error('invalid docx');
  }
  const xml = await xmlFile.async('string');
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const paragraphs = Array.from(doc.getElementsByTagName('w:p'));
  return paragraphs.map((p) => {
    return Array.from(p.getElementsByTagName('w:t')).map((t) => t.textContent).join('');
  }).map((t) => t.trim()).filter(Boolean);
}

function splitParagraphToSentences(text) {
  const parts = text.split(/(?<=[。！？!?；.])\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) return parts;
  if (/[。！？!?；.]/.test(text)) return parts.length ? parts : [text];
  return [text];
}

function splitTextToShots(paragraphs) {
  const shots = [];
  for (const para of paragraphs) {
    const parts = splitParagraphToSentences(para);
    shots.push(...parts);
  }
  return shots.filter(Boolean);
}

function buildRowsFromCopyList(copyList) {
  return copyList.map((copy, i) => createEmptyRow(String(i + 1), copy));
}

function importWordShots(copyList, mode) {
  const newRows = buildRowsFromCopyList(copyList);
  const start = rows.length;
  if (start === 0) {
    rows = newRows;
  } else {
    newRows.forEach((row, i) => {
      row.order = String(start + i + 1);
      rows.push(row);
    });
  }
  renderTable({ scrollToIndex: start });
  autoSave();
  const modeText = mode === 'line' ? '\u6309\u884c' : '\u6309\u53e5\u5b50';
  const appendText = start > 0 ? '\uff0c\u8ffd\u52a0\u5230\u672b\u5c3e' : '';
  document.getElementById('saveHint').textContent = modeText + '\u5bfc\u5165 ' + copyList.length + ' \u6761\u6587\u6848' + appendText + ' \u00b7 ' + new Date().toLocaleTimeString();
}

function exportExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Excel \u5bfc\u51fa\u5e93\u672a\u52a0\u8f7d\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u540e\u91cd\u8bd5');
    return;
  }
  const title = document.getElementById('videoTitle').value;
  const intro = document.getElementById('videoIntro').value;
  const sheetData = [
    ['\u89c6\u9891\u6807\u9898', title],
    ['\u89c6\u9891\u7b80\u4ecb', intro],
    [],
    ['\u955c\u53f7', '\u955c\u5934\u7c7b\u578b', '\u955c\u5934\u8fd0\u52a8', '\u5185\u5bb9', '\u6587\u6848', '\u97f3\u6548', '\u5907\u6ce8', '\u662f\u5426\u6709\u56fe'],
    ...rows.map((row) => [
      row.order,
      row.shotType,
      row.movement,
      row.content,
      row.copy,
      row.sound,
      row.remark,
      row.image ? '\u662f' : ''
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = [
    { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 40 },
    { wch: 40 }, { wch: 16 }, { wch: 16 }, { wch: 10 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '\u5206\u955c\u811a\u672c');
  const filename = sanitizeFilename(title) + '.xlsx';
  XLSX.writeFile(wb, filename);
  document.getElementById('saveHint').textContent = '\u5df2\u5bfc\u51fa\u300c' + filename + '\u300d \u00b7 ' + new Date().toLocaleTimeString();
}

async function importWordFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'docx') {
    alert('\u6682\u4ec5\u652f\u6301 .docx \u683c\u5f0f\u7684 Word \u6587\u4ef6\uff08\u8bf7\u5728 Word \u4e2d\u53e6\u5b58\u4e3a .docx\uff09');
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const paragraphs = await extractDocxParagraphs(arrayBuffer);
    if (paragraphs.length === 0) {
      alert('Word \u6587\u4ef6\u4e2d\u672a\u627e\u5230\u6587\u672c\u5185\u5bb9');
      return;
    }

    const useSentenceMode = confirm(
      '\u68c0\u6d4b\u5230 ' + paragraphs.length + ' \u6bb5\u843d\u3002\n\n' +
      '\u70b9\u300c\u786e\u5b9a\u300d= \u6309\u53e5\u5b50\u62c6\u5206\uff08\u63a8\u8350\uff09\n' +
      '\u70b9\u300c\u53d6\u6d88\u300d= \u6309\u6bb5\u843d\u62c6\u5206\uff08\u6bcf\u6362\u884c\u4e00\u4e2a\u955c\u5934\uff09'
    );

    const copyList = useSentenceMode ? splitTextToShots(paragraphs) : paragraphs;
    if (copyList.length === 0) {
      alert('\u672a\u80fd\u62c6\u5206\u51fa\u6709\u6548\u6587\u6848');
      return;
    }

    importWordShots(copyList, useSentenceMode ? 'sentence' : 'line');
  } catch (err) {
    alert('\u5bfc\u5165\u5931\u8d25\uff0c\u8bf7\u786e\u8ba4\u6587\u4ef6\u662f\u6709\u6548\u7684 .docx \u683c\u5f0f');
  }
}

function bindEvents() {
  document.getElementById('addRowBtn').addEventListener('click', addRow);
  document.getElementById('renumberBtn').addEventListener('click', renumberRows);
  document.getElementById('saveBtn').addEventListener('click', saveProject);
  document.getElementById('loadBtn').addEventListener('click', () => document.getElementById('loadInput').click());
  document.getElementById('importWordBtn').addEventListener('click', () => document.getElementById('importWordInput').click());
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  document.getElementById('exportExcelBtn').addEventListener('click', exportExcel);
  document.getElementById('resetBtn').addEventListener('click', resetProject);
  document.getElementById('videoTitle').addEventListener('input', autoSave);
  document.getElementById('videoIntro').addEventListener('input', autoSave);

  document.getElementById('loadInput').addEventListener('change', (e) => {
    loadProject(e.target.files[0]);
    e.target.value = '';
  });

  document.getElementById('importWordInput').addEventListener('change', (e) => {
    importWordFile(e.target.files[0]);
    e.target.value = '';
  });

  document.getElementById('shotTable').addEventListener('input', (e) => {
    const el = e.target;
    if (el.tagName !== 'TEXTAREA') return;
    const index = Number(el.dataset.index);
    const field = el.dataset.field;
    if (!Number.isNaN(index) && field) {
      updateField(index, field, el.value);
      autoResize(el);
    }
  });

  document.getElementById('shotTable').addEventListener('click', (e) => {
    const uploadIndex = e.target.dataset.upload;
    if (uploadIndex !== undefined) {
      triggerUpload(Number(uploadIndex));
      return;
    }
    const clearIndex = e.target.dataset.clearImage;
    if (clearIndex !== undefined) {
      removeImage(Number(clearIndex));
      return;
    }
    const insertIndex = e.target.dataset.insert;
    if (insertIndex !== undefined) {
      insertRowAfter(Number(insertIndex));
      return;
    }
    const deleteIndex = e.target.dataset.delete;
    if (deleteIndex !== undefined) {
      deleteRow(Number(deleteIndex));
    }
  });

  document.getElementById('shotTable').addEventListener('change', (e) => {
    const index = Number(e.target.dataset.file);
    if (!Number.isNaN(index)) {
      uploadImage(index, e.target.files[0]);
      e.target.value = '';
    }
  });
}

async function initSaveHint() {
  if (await checkServerAvailable()) {
    document.getElementById('saveHint').textContent = '\u6570\u636e\u81ea\u52a8\u4fdd\u5b58\u5728\u6d4f\u89c8\u5668\u672c\u5730 \u00b7 \u300c\u4fdd\u5b58\u9879\u76ee\u300d\u5c06\u5199\u5165\u811a\u672c\u6587\u4ef6\u5939';
  }
}

function init() {
  bindEvents();
  initSaveHint();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      applyProjectData(JSON.parse(saved));
    } else {
      rows = getDefaultRows();
      renderTable();
    }
  } catch (e) {
    rows = getDefaultRows();
    renderTable();
  }
}

init();

