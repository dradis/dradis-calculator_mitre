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

        if (!tacticSelect || !techniqueSelect || !subtechniqueSelect) return;

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

        if (!tacticSelect || !techniqueSelect || !subtechniqueSelect) return;

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
  }

  new MitreCalculator();
});
