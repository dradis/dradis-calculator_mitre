document.addEventListener('turbo:load', () => {
  if (!document.querySelector('[data-behavior~=mitre-calc]')) return;

  class MitreCalculator {
    constructor() {
      this.matrices = ['enterprise', 'mobile', 'ics'];
      this.mitreData = {};
      this.result = document.querySelector('[data-behavior="mitre-result"]');
      this.selects = {};
      this.init();
    }

    async init() {
      try {
        await this.loadMitreData();
        this.initializeSelectors();
        this.setupEventListeners();
        this.preSelectFromResult();
      } catch (error) {
        console.error('Failed to initialize MITRE Calculator:', error);
      }
    }

    async loadMitreData() {
      const response = await fetch(
        '/assets/dradis/plugins/calculators/mitre/data/mitre_data.json'
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      this.mitreData = await response.json();
    }

    initializeSelectors() {
      this.matrices.forEach((matrix) => {
        const tacticSelect = document.querySelector(
          `select[data-type="${matrix}-tactic"]`
        );
        const techniqueSelect = document.querySelector(
          `select[data-type="${matrix}-technique"]`
        );
        const subtechniqueSelect = document.querySelector(
          `select[data-type="${matrix}-subtechnique"]`
        );

        this.selects[matrix] = {
          tactic: tacticSelect,
          technique: techniqueSelect,
          subtechnique: subtechniqueSelect,
        };

        this.setupMatrix(matrix);
      });
    }

    setupMatrix(matrix) {
      const { tactic, technique, subtechnique } = this.selects[matrix];

      this.setPrompt(tactic, 'Select a tactic');
      this.setPrompt(technique, 'Select a technique');
      this.setPrompt(subtechnique, 'Select a sub-technique');
      technique.disabled = true;
      subtechnique.disabled = true;

      this.mitreData[matrix].tactics.forEach((tacticData) => {
        const option = document.createElement('option');
        option.value = tacticData.id;
        option.textContent = tacticData.name;
        tactic.appendChild(option);
      });
    }

    setupEventListeners() {
      this.matrices.forEach((matrix) => {
        const { tactic, technique, subtechnique } = this.selects[matrix];

        tactic.addEventListener('change', () => {
          this.handleTacticChange(matrix);
        });

        technique.addEventListener('change', () => {
          this.handleTechniqueChange(matrix);
        });

        subtechnique.addEventListener('change', () => {
          this.handleSubtechniqueChange(matrix);
        });
      });
    }

    handleTacticChange(matrix) {
      const { tactic, technique, subtechnique } = this.selects[matrix];
      const selectedTactic = this.mitreData[matrix].tactics.find(
        (t) => t.id === tactic.value
      );

      this.setPrompt(technique, 'Select a technique');
      this.setPrompt(subtechnique, 'Select a sub-technique');
      technique.disabled = true;
      subtechnique.disabled = true;

      if (selectedTactic) {
        this.populateTechniques(selectedTactic, technique);
        technique.disabled = false;
      }

      this.updateTacticResults(matrix, selectedTactic);
    }

    handleTechniqueChange(matrix) {
      const { tactic, technique, subtechnique } = this.selects[matrix];
      const selectedTactic = this.mitreData[matrix].tactics.find(
        (t) => t.id === tactic.value
      );
      const selectedTechnique = selectedTactic.techniques.find(
        (tech) => tech.id === technique.value
      );

      this.setPrompt(subtechnique, 'Select a sub-technique');
      subtechnique.disabled = true;

      if (selectedTechnique.subtechniques.length > 0) {
        this.populateSubtechniques(selectedTechnique, subtechnique);
        subtechnique.disabled = false;
      }

      this.updateTechniqueResults(matrix, selectedTechnique);
    }

    handleSubtechniqueChange(matrix) {
      const { tactic, technique, subtechnique } = this.selects[matrix];
      const selectedTactic = this.mitreData[matrix].tactics.find(
        (t) => t.id === tactic.value
      );
      const selectedTechnique = selectedTactic.techniques.find(
        (tech) => tech.id === technique.value
      );
      const selectedSubtechnique = selectedTechnique.subtechniques.find(
        (s) => s.id === subtechnique.value
      );

      this.updateSubtechniqueResults(matrix, selectedSubtechnique);
    }

    preSelectFromResult() {
      this.matrices.forEach((matrix) => {
        this.preSelectMatrix(matrix);
      });
    }

    preSelectMatrix(matrix) {
      const base = `MITRE.${this.titleCase(matrix)}`;
      const tacticId = this.getResultValue(`${base}.Tactic.ID`);

      if (!tacticId || tacticId === 'N/A') return;

      const { tactic, technique, subtechnique } = this.selects[matrix];

      if (this.selectOption(tactic, tacticId)) {
        const selectedTactic = this.mitreData[matrix].tactics.find(
          (t) => t.id === tacticId
        );
        this.populateTechniques(selectedTactic, technique);
        technique.disabled = false;

        const techniqueId = this.getResultValue(`${base}.Technique.ID`);
        if (
          techniqueId &&
          techniqueId !== 'N/A' &&
          this.selectOption(technique, techniqueId)
        ) {
          const selectedTechnique = selectedTactic.techniques.find(
            (t) => t.id === techniqueId
          );

          if (selectedTechnique.subtechniques.length > 0) {
            this.populateSubtechniques(selectedTechnique, subtechnique);
            subtechnique.disabled = false;

            const subtechniqueId = this.getResultValue(
              `${base}.Sub-technique.ID`
            );
            if (subtechniqueId && subtechniqueId !== 'N/A') {
              this.selectOption(subtechnique, subtechniqueId);
            }
          }
        }
      }
    }

    getResultValue(label) {
      // Captures the line with the label and returns its value
      const regex = new RegExp(
        `\\#\\[${this.escapeRegex(label)}\\]\\#\\n(.*?)(?=\\n|$)`,
        'i'
      );
      const match = this.result.value.match(regex);
      return match ? match[1].trim() : null;
    }

    selectOption(select, value) {
      const option = select.querySelector(`option[value="${value}"]`);
      if (option) {
        select.value = value;
        return true;
      }
      return false;
    }

    escapeRegex(string) {
      // Escapes special characters in a regex string since . and [] have special meanings
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    setPrompt(select, prompt) {
      select.innerHTML = `<option value="" disabled selected>${prompt}</option>`;
    }

    populateTechniques(tactic, select) {
      tactic.techniques.forEach((tech) => {
        const option = document.createElement('option');
        option.value = tech.id;
        option.textContent = tech.name;
        select.appendChild(option);
      });
    }

    populateSubtechniques(technique, select) {
      technique.subtechniques.forEach((sub) => {
        const option = document.createElement('option');
        option.value = sub.id;
        option.textContent = sub.name;
        select.appendChild(option);
      });
    }

    updateResult(label, value) {
      // Captures the line with the label and replaces its value
      const regex = new RegExp(`(\\#\\[${label}\\]\\#\\n)(.*?)(\\n|$)`, 'gi');
      this.result.value = this.result.value.replace(regex, `$1${value}$3`);
    }

    updateTacticResults(matrix, tactic) {
      const base = `MITRE.${this.titleCase(matrix)}`;
      this.updateResult(`${base}.Tactic`, tactic.name);
      this.updateResult(`${base}.Tactic.ID`, tactic.id);
      this.resetTechniqueAndSubtechniqueResults(matrix);
    }

    updateTechniqueResults(matrix, technique) {
      const base = `MITRE.${this.titleCase(matrix)}`;
      this.updateResult(`${base}.Technique`, technique.name);
      this.updateResult(`${base}.Technique.ID`, technique.id);
      this.resetSubtechniqueResults(matrix);
    }

    updateSubtechniqueResults(matrix, subtechnique) {
      const base = `MITRE.${this.titleCase(matrix)}`;
      this.updateResult(`${base}.Sub-technique`, subtechnique.name);
      this.updateResult(`${base}.Sub-technique.ID`, subtechnique.id);
    }

    resetTechniqueAndSubtechniqueResults(matrix) {
      this.resetTechniqueResults(matrix);
      this.resetSubtechniqueResults(matrix);
    }

    resetTechniqueResults(matrix) {
      const base = `MITRE.${this.titleCase(matrix)}`;
      this.updateResult(`${base}.Technique`, 'N/A');
      this.updateResult(`${base}.Technique.ID`, 'N/A');
    }

    resetSubtechniqueResults(matrix) {
      const base = `MITRE.${this.titleCase(matrix)}`;
      this.updateResult(`${base}.Sub-technique`, 'N/A');
      this.updateResult(`${base}.Sub-technique.ID`, 'N/A');
    }

    titleCase(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }

  new MitreCalculator();
});
