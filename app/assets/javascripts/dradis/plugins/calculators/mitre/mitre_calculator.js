document.addEventListener('turbo:load', () => {
  if (!document.querySelector('body.dradis-plugins-calculators-mitre-issues'))
    return;

  class MitreCalculator {
    constructor() {
      this.mitreData = {};
      this.selects = {};
      this.init();
    }

    async init() {
      try {
        await this.loadMitreData();
        this.initializeSelectors();
        this.setupEventListeners();
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
      const matrices = ['enterprise', 'mobile', 'ics'];

      matrices.forEach((matrix) => {
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
      const matrices = ['enterprise', 'mobile', 'ics'];

      matrices.forEach((matrix) => {
        const { tactic, technique, subtechnique } = this.selects[matrix];

        tactic.addEventListener('change', () => {
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
        });

        technique.addEventListener('change', () => {
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
        });

        subtechnique.addEventListener('change', () => {
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
        });
      });
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
      const textarea = document.querySelector('[data-behavior="mitre-result"]');
      const regex = new RegExp(`(\\#\\[${label}\\]\\#\\n)(.*?)(\\n|$)`, 'gi');
      textarea.value = textarea.value.replace(regex, `$1${value}$3`);
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
