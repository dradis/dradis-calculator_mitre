let mitreData = {};
let activeDomain = 'enterprise';

// === Init ===

document.addEventListener('DOMContentLoaded', () => {
  fetch('/assets/dradis/plugins/calculators/mitre/data/mitre_data.json')
    .then(response => response.json())
    .then(data => {
      mitreData = data;
      populateTacticDropdown();
    })
    .catch(error => {
      console.error('Failed to load mitre_data.json', error);
    });

  // === Domain switching (Tabs) ===
  document.querySelectorAll('#mitre-tabs .nav-link').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#mitre-tabs .nav-link').forEach(el => el.classList.remove('active'));
      e.target.closest('a').classList.add('active');
      activeDomain = e.target.closest('a')?.dataset.domain;
      clearAllDropdowns();
      populateTacticDropdown();
    });
  });

  // === Clear button ===
  document.querySelector('.clear-button')?.addEventListener('click', () => {
    const textarea = document.getElementById('mitre-output');
    textarea.value = [
      '#[MITRE.tactics]#',
      'N/A',
      '',
      '#[MITRE.technique]#',
      'N/A',
      '',
      '#[MITRE.sub-technique]#',
      'N/A'
    ].join('\n');
  });

  // === Add buttons (Tactic / Technique / Sub-technique) ===
  document.querySelectorAll('button[data-type]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.type;
      const select = document.getElementById(`${type}-select`);
      const value = select?.selectedOptions[0]?.textContent;
      const style = document.querySelector('input[name="style"]:checked')?.value || 'inline';

      if (value) {
        addValueToTextarea(type, value, style);
      }
    });
  });
});

// === Clear dropdowns and disable buttons ===

function clearAllDropdowns() {
  document.getElementById('tactic-select').innerHTML = '';
  document.getElementById('technique-select').innerHTML = '';
  document.getElementById('subtechnique-select').innerHTML = '';

  document.getElementById('technique-select').disabled = true;
  document.getElementById('subtechnique-select').disabled = true;

  document.querySelector('button[data-type="technique"]').disabled = true;
  document.querySelector('button[data-type="subtechnique"]').disabled = true;
}

// === Populate Tactic Dropdown ===

function populateTacticDropdown() {
  const tacticSelect = document.getElementById('tactic-select');
  clearAllDropdowns();
  const domainTactics = mitreData[activeDomain]?.tactics || [];

  domainTactics.forEach(tactic => {
    const option = document.createElement('option');
    option.value = tactic.name;
    option.textContent = tactic.name;
    tacticSelect.appendChild(option);
  });

  tacticSelect.addEventListener('change', populateTechniqueDropdown);

  if (tacticSelect.options.length > 0) {
    tacticSelect.selectedIndex = 0;
    populateTechniqueDropdown();
  }
}

// === Populate Technique Dropdown ===

function populateTechniqueDropdown() {
  const techniqueSelect = document.getElementById('technique-select');
  const techniqueAddBtn = document.querySelector('button[data-type="technique"]');
  const subtechSelect = document.getElementById('subtechnique-select');
  const subtechAddBtn = document.querySelector('button[data-type="subtechnique"]');

  techniqueSelect.innerHTML = '';
  techniqueSelect.disabled = true;
  techniqueAddBtn.disabled = true;

  subtechSelect.innerHTML = '';
  subtechSelect.disabled = true;
  subtechAddBtn.disabled = true;

  const tacticSelect = document.getElementById('tactic-select');
  const selectedTacticName = tacticSelect.value;
  const tactic = mitreData[activeDomain]?.tactics.find(t => t.name === selectedTacticName);
  if (!tactic) return;

  const techniques = tactic.techniques || [];
  if (techniques.length === 0) return;

  techniques.forEach(technique => {
    const option = document.createElement('option');
    option.value = technique.name;
    option.textContent = technique.name;
    techniqueSelect.appendChild(option);
  });

  techniqueSelect.disabled = false;
  techniqueAddBtn.disabled = false;

  techniqueSelect.addEventListener('change', populateSubtechniqueDropdown);

  if (techniqueSelect.options.length > 0) {
    techniqueSelect.selectedIndex = 0;
    populateSubtechniqueDropdown();
  }
}

// === Populate Sub-technique Dropdown ===

function populateSubtechniqueDropdown() {
  const subtechSelect = document.getElementById('subtechnique-select');
  const subtechAddBtn = document.querySelector('button[data-type="subtechnique"]');

  subtechSelect.innerHTML = '';
  subtechSelect.disabled = true;
  subtechAddBtn.disabled = true;

  const techniqueSelect = document.getElementById('technique-select');
  const selectedTechniqueName = techniqueSelect.value;

  const tacticSelect = document.getElementById('tactic-select');
  const selectedTacticName = tacticSelect.value;

  const tactic = mitreData[activeDomain]?.tactics.find(t => t.name === selectedTacticName);
  if (!tactic) return;

  const technique = tactic.techniques.find(tech => tech.name === selectedTechniqueName);
  if (!technique) return;

  const subtechniques = technique.subtechniques || [];
  if (subtechniques.length === 0) return;

  subtechSelect.disabled = false;
  subtechAddBtn.disabled = false;

  subtechniques.forEach(sub => {
    const option = document.createElement('option');
    option.value = sub.name;
    option.textContent = sub.name;
    subtechSelect.appendChild(option);
  });
}

// === Add Selected Value to Textarea ===

function addValueToTextarea(type, value, style) {
  const textarea = document.getElementById('mitre-output');
  const lines = textarea.value.split('\n');

  const headerMap = {
    tactic: 'tactics',
    technique: 'technique',
    subtechnique: 'sub-technique'
  };
  const sectionHeader = `#[MITRE.${headerMap[type]}]#`;

  const headerIndex = lines.findIndex(line => line.trim() === sectionHeader);
  if (headerIndex === -1) return;

  const values = [];
  let endIndex = headerIndex + 1;

  while (endIndex < lines.length && !lines[endIndex].startsWith('#[')) {
    const line = lines[endIndex].trim();
    if (line && line !== 'N/A') {
      line.split(',').forEach(item => {
        const trimmed = item.trim();
        if (trimmed) values.push(trimmed);
      });
    }
    endIndex++;
  }

  if (!values.includes(value)) {
    values.push(value);
  }

  lines.splice(headerIndex + 1, endIndex - headerIndex - 1);

  if (values.length === 0) {
    lines.splice(headerIndex + 1, 0, 'N/A');
  } else if (style === 'inline') {
    lines.splice(headerIndex + 1, 0, values.join(', '));
  } else {
    lines.splice(headerIndex + 1, 0, ...values);
  }

  let afterIndex = headerIndex + 1 + values.length;
  if (style === 'inline' || values.length === 0) {
    afterIndex = headerIndex + 2;
  }

  if (lines[afterIndex] !== '') {
    lines.splice(afterIndex, 0, '');
  }

  while (lines[afterIndex + 1] === '') {
    lines.splice(afterIndex + 1, 1);
  }

  textarea.value = lines.join('\n');
}
