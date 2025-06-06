document.addEventListener('turbo:load', () => {
  if (!document.querySelector('body.dradis-plugins-calculators-mitre-issues')) {
    return;
  }

  class MitreCalculator {
    constructor() {
      this.elements = {
        tacticSelect: document.querySelector('[data-type~=tactic]'),
        techniqueSelect: document.querySelector('[data-type~=technique]'),
        subtechSelect: document.querySelector('[data-type~=subtechnique]'),
        textarea: document.querySelector('[data-behavior~=mitre-output]'),
        tabs: document.querySelectorAll(
          '[data-behavior~=mitre-tabs] [data-domain]'
        ),
        clearButton: document.querySelector('[data-behavior~=clear]'),
        allSelects: document.querySelectorAll('select[data-type]'),
        resultFormatRadios: document.querySelectorAll(
          'input[name="result_format"]'
        ),
      };

      this.state = {
        mitreData: {},
        activeDomain: 'enterprise',
      };

      this.constants = {
        HEADER_MAP: {
          tactic: 'tactics',
          technique: 'technique',
          subtechnique: 'sub-technique',
        },
        DEFAULT_TEXTAREA_CONTENT: [
          '#[MITRE.tactics]#',
          'N/A',
          '',
          '#[MITRE.technique]#',
          'N/A',
          '',
          '#[MITRE.sub-technique]#',
          'N/A',
        ].join('\n'),
      };

      this.init();
    }

    async init() {
      try {
        await this.loadMitreData();
        this.bindEvents();
        this.populateTacticDropdown();
      } catch (error) {
        console.error('Failed to initialize MITRE Calculator:', error);
      }
    }

    async loadMitreData() {
      const response = await fetch(
        '/assets/dradis/plugins/calculators/mitre/data/mitre_data.json'
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.state.mitreData = await response.json();
    }

    bindEvents() {
      this.bindTabEvents();
      this.bindClearEvent();
      this.bindSelectEvents();
      this.bindResultFormatEvents();
    }

    bindTabEvents() {
      this.elements.tabs.forEach((tab) => {
        tab.addEventListener('click', this.handleTabClick.bind(this));
      });
    }

    bindClearEvent() {
      this.elements.clearButton?.addEventListener('click', () => {
        this.elements.textarea.value = this.constants.DEFAULT_TEXTAREA_CONTENT;
      });
    }

    bindSelectEvents() {
      this.elements.allSelects.forEach((select) => {
        select.addEventListener('change', this.handleSelectChange.bind(this));
      });
    }

    bindResultFormatEvents() {
      this.elements.resultFormatRadios.forEach((radio) => {
        radio.addEventListener(
          'change',
          this.handleResultFormatChange.bind(this)
        );
      });
    }

    handleTabClick(event) {
      event.preventDefault();

      this.elements.tabs.forEach((tab) => tab.classList.remove('active'));

      const clickedTab = event.target.closest('[data-domain]');
      clickedTab.classList.add('active');

      this.state.activeDomain = clickedTab.dataset.domain;

      this.clearAllDropdowns();
      this.populateTacticDropdown();
    }

    handleSelectChange(event) {
      const select = event.target;
      const type = select.dataset.type;
      const selectedOption = select.selectedOptions[0];

      if (!selectedOption || selectedOption.value === '') return;

      const value = selectedOption.textContent;
      const resultFormat =
        document.querySelector('input[name="result_format"]:checked')?.value ||
        'inline';

      if (value) {
        this.addValueToTextarea(type, value, resultFormat);
      }
    }

    handleResultFormatChange() {
      this.reformatAllSections();
    }

    clearAllDropdowns() {
      const { tacticSelect, techniqueSelect, subtechSelect } = this.elements;

      [tacticSelect, techniqueSelect, subtechSelect].forEach((select) => {
        select.innerHTML = '';
      });

      techniqueSelect.disabled = true;
      subtechSelect.disabled = true;
    }

    populateTacticDropdown() {
      const domainTactics =
        this.state.mitreData[this.state.activeDomain]?.tactics || [];

      this.clearAllDropdowns();

      if (domainTactics.length === 0) return;

      const promptOption = this.createOption('', 'Select a tactic');
      this.elements.tacticSelect.appendChild(promptOption);

      domainTactics.forEach((tactic) => {
        const option = this.createOption(tactic.name, tactic.name);
        this.elements.tacticSelect.appendChild(option);
      });

      this.elements.tacticSelect.removeEventListener(
        'change',
        this.populateTechniqueDropdown
      );
      this.elements.tacticSelect.addEventListener(
        'change',
        this.populateTechniqueDropdown.bind(this)
      );
    }

    populateTechniqueDropdown() {
      const { techniqueSelect, subtechSelect, tacticSelect } = this.elements;

      techniqueSelect.innerHTML = '';
      techniqueSelect.disabled = true;
      subtechSelect.innerHTML = '';
      subtechSelect.disabled = true;

      const selectedTacticName = tacticSelect.value;
      if (!selectedTacticName) return;

      const tactic = this.findTacticByName(selectedTacticName);

      if (!tactic || !tactic.techniques?.length) return;

      // Add prompt option
      const promptOption = this.createOption('', 'Select a technique');
      techniqueSelect.appendChild(promptOption);

      tactic.techniques.forEach((technique) => {
        const option = this.createOption(technique.name, technique.name);
        techniqueSelect.appendChild(option);
      });

      techniqueSelect.disabled = false;

      techniqueSelect.removeEventListener(
        'change',
        this.populateSubtechniqueDropdown
      );
      techniqueSelect.addEventListener(
        'change',
        this.populateSubtechniqueDropdown.bind(this)
      );
    }

    populateSubtechniqueDropdown() {
      const { subtechSelect, tacticSelect, techniqueSelect } = this.elements;

      subtechSelect.innerHTML = '';
      subtechSelect.disabled = true;

      const selectedTacticName = tacticSelect.value;
      const selectedTechniqueName = techniqueSelect.value;

      if (!selectedTechniqueName) return;

      const tactic = this.findTacticByName(selectedTacticName);
      if (!tactic) return;

      const technique = tactic.techniques?.find(
        (tech) => tech.name === selectedTechniqueName
      );
      if (!technique || !technique.subtechniques?.length) return;

      const promptOption = this.createOption('', 'Select a sub-technique');
      subtechSelect.appendChild(promptOption);

      technique.subtechniques.forEach((subtechnique) => {
        const option = this.createOption(subtechnique.name, subtechnique.name);
        subtechSelect.appendChild(option);
      });

      subtechSelect.disabled = false;
    }

    findTacticByName(tacticName) {
      return this.state.mitreData[this.state.activeDomain]?.tactics?.find(
        (tactic) => tactic.name === tacticName
      );
    }

    createOption(value, text) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      return option;
    }

    addValueToTextarea(type, value, resultFormat) {
      const lines = this.elements.textarea.value.split('\n');
      const sectionHeader = `#[MITRE.${this.constants.HEADER_MAP[type]}]#`;

      const headerIndex = lines.findIndex(
        (line) => line.trim() === sectionHeader
      );
      if (headerIndex === -1) return;

      const { values, endIndex } = this.extractExistingValues(
        lines,
        headerIndex
      );

      if (!values.includes(value)) {
        values.push(value);
      }

      this.replaceSectionInLines(
        lines,
        headerIndex,
        endIndex,
        values,
        resultFormat
      );

      this.elements.textarea.value = lines.join('\n');
    }

    reformatAllSections() {
      const resultFormat =
        document.querySelector('input[name="result_format"]:checked')?.value ||
        'inline';
      const lines = this.elements.textarea.value.split('\n');

      Object.keys(this.constants.HEADER_MAP).forEach((type) => {
        const sectionHeader = `#[MITRE.${this.constants.HEADER_MAP[type]}]#`;
        const headerIndex = lines.findIndex(
          (line) => line.trim() === sectionHeader
        );

        if (headerIndex !== -1) {
          const { values, endIndex } = this.extractExistingValues(
            lines,
            headerIndex
          );
          this.replaceSectionInLines(
            lines,
            headerIndex,
            endIndex,
            values,
            resultFormat
          );
        }
      });

      this.elements.textarea.value = lines.join('\n');
    }

    extractExistingValues(lines, headerIndex) {
      const values = [];
      let endIndex = headerIndex + 1;

      while (endIndex < lines.length && !lines[endIndex].startsWith('#[')) {
        const line = lines[endIndex].trim();
        if (line && line !== 'N/A') {
          line.split(',').forEach((item) => {
            const trimmed = item.trim();
            if (trimmed) values.push(trimmed);
          });
        }
        endIndex++;
      }

      return { values, endIndex };
    }

    replaceSectionInLines(lines, headerIndex, endIndex, values, resultFormat) {
      lines.splice(headerIndex + 1, endIndex - headerIndex - 1);

      if (values.length === 0) {
        lines.splice(headerIndex + 1, 0, 'N/A');
      } else if (resultFormat === 'inline') {
        lines.splice(headerIndex + 1, 0, values.join(', '));
      } else {
        lines.splice(headerIndex + 1, 0, ...values);
      }

      this.ensureProperSpacing(lines, headerIndex, values, resultFormat);
    }

    ensureProperSpacing(lines, headerIndex, values, resultFormat) {
      const afterIndex =
        headerIndex +
        1 +
        (resultFormat === 'inline' || values.length === 0 ? 1 : values.length);

      if (lines[afterIndex] !== '') {
        lines.splice(afterIndex, 0, '');
      }

      while (lines[afterIndex + 1] === '') {
        lines.splice(afterIndex + 1, 1);
      }
    }
  }

  new MitreCalculator();
});
