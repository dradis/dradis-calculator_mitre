document.addEventListener('turbo:load', () => {
  if (!document.querySelector('body.dradis-plugins-calculators-mitre-issues'))
    return;

  class MitreCalculator {
    constructor() {
      this.mitreData = {};
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

        this.setPrompt(tacticSelect, 'Select a tactic');
        this.setPrompt(techniqueSelect, 'Select a technique');
        this.setPrompt(subtechniqueSelect, 'Select a sub-technique');
        techniqueSelect.disabled = true;
        subtechniqueSelect.disabled = true;

        this.mitreData[matrix].tactics.forEach((tactic) => {
          const option = document.createElement('option');
          option.value = tactic.id;
          option.textContent = tactic.name;
          tacticSelect.appendChild(option);
        });
      });
    }

    setupEventListeners() {
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

        tacticSelect.addEventListener('change', () => {
          const selectedTactic = this.mitreData[matrix].tactics.find(
            (t) => t.id === tacticSelect.value
          );

          this.setPrompt(techniqueSelect, 'Select a technique');
          this.setPrompt(subtechniqueSelect, 'Select a sub-technique');
          techniqueSelect.disabled = true;
          subtechniqueSelect.disabled = true;

          if (selectedTactic) {
            this.populateTechniques(selectedTactic, techniqueSelect);
            techniqueSelect.disabled = false;
          }
        });

        techniqueSelect.addEventListener('change', () => {
          const selectedTactic = this.mitreData[matrix].tactics.find(
            (tactic) => tactic.id === tacticSelect.value
          );
          const selectedTechnique = selectedTactic?.techniques.find(
            (technique) => technique.id === techniqueSelect.value
          );

          this.setPrompt(subtechniqueSelect, 'Select a sub-technique');
          subtechniqueSelect.disabled = true;

          if (selectedTechnique?.subtechniques.length > 0) {
            this.populateSubtechniques(selectedTechnique, subtechniqueSelect);
            subtechniqueSelect.disabled = false;
          }
        });

        this.bindResultUpdates(
          matrix,
          tacticSelect,
          techniqueSelect,
          subtechniqueSelect
        );
      });
    }

    setPrompt(select, prompt) {
      select.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = prompt;
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);
    }

    populateTechniques(tactic, techniqueSelect) {
      tactic.techniques.forEach((tech) => {
        const option = document.createElement('option');
        option.value = tech.id;
        option.textContent = tech.name;
        techniqueSelect.appendChild(option);
      });
    }

    populateSubtechniques(technique, subtechniqueSelect) {
      technique.subtechniques.forEach((subtechnique) => {
        const option = document.createElement('option');
        option.value = subtechnique.id;
        option.textContent = subtechnique.name;
        subtechniqueSelect.appendChild(option);
      });
    }

    updateResult(label, value) {
      const textarea = document.querySelector('[data-behavior="mitre-result"]');
      const regex = new RegExp(`(\\#\\[${label}\\]\\#\\n)(.*?)(\\n|$)`, 'gi');
      textarea.value = textarea.value.replace(regex, `$1${value}$3`);
    }

    bindResultUpdates(
      matrix,
      tacticSelect,
      techniqueSelect,
      subtechniqueSelect
    ) {
      tacticSelect.addEventListener('change', () => {
        const tactic = this.mitreData[matrix].tactics.find(
          (t) => t.id === tacticSelect.value
        );

        if (tactic) {
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Tactic`,
            tactic.name
          );
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Tactic.ID`,
            tactic.id
          );

          this.updateResult(`MITRE.${this.titleCase(matrix)}.Technique`, 'N/A');
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Technique.ID`,
            'N/A'
          );
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Sub-technique`,
            'N/A'
          );
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Sub-technique.ID`,
            'N/A'
          );
        }
      });

      techniqueSelect.addEventListener('change', () => {
        const tactic = this.mitreData[matrix].tactics.find(
          (t) => t.id === tacticSelect.value
        );
        const technique = tactic?.techniques.find(
          (t) => t.id === techniqueSelect.value
        );

        if (technique) {
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Technique`,
            technique.name
          );
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Technique.ID`,
            technique.id
          );

          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Sub-technique`,
            'N/A'
          );
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Sub-technique.ID`,
            'N/A'
          );
        }
      });

      subtechniqueSelect.addEventListener('change', () => {
        const tactic = this.mitreData[matrix].tactics.find(
          (t) => t.id === tacticSelect.value
        );
        const technique = tactic?.techniques.find(
          (t) => t.id === techniqueSelect.value
        );
        const subtechnique = technique?.subtechniques.find(
          (s) => s.id === subtechniqueSelect.value
        );

        if (subtechnique) {
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Sub-technique`,
            subtechnique.name
          );
          this.updateResult(
            `MITRE.${this.titleCase(matrix)}.Sub-technique.ID`,
            subtechnique.id
          );
        }
      });
    }

    titleCase(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }

  new MitreCalculator();
});
