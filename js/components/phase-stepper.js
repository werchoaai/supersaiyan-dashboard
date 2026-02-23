/**
 * Phase Stepper — visual progress bar for task phases
 */

const PHASES = ['PLAN', 'HUMAN_APPROVE', 'IMPLEMENT', 'HUMAN_FINAL'];
const PHASE_LABELS = {
  'PLAN': 'Plan',
  'HUMAN_APPROVE': 'Approve',
  'IMPLEMENT': 'Implement',
  'HUMAN_FINAL': 'Final Review'
};

function renderPhaseStepper(currentPhase, status) {
  const currentIdx = PHASES.indexOf(currentPhase);
  const isClosed = status === 'CLOSED';

  const steps = PHASES.map((phase, i) => {
    let state = 'future';
    if (isClosed) {
      state = 'completed';
    } else if (i < currentIdx) {
      state = 'completed';
    } else if (i === currentIdx) {
      state = 'current';
    }

    const icon = state === 'completed'
      ? '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'
      : `<span>${i + 1}</span>`;

    const line = i < PHASES.length - 1
      ? `<div class="stepper-line"></div>`
      : '';

    return `
      <div class="stepper-step ${state}">
        <div class="stepper-circle">${icon}</div>
        ${line}
        <div class="stepper-label">${PHASE_LABELS[phase]}</div>
      </div>
    `;
  }).join('');

  let closedStep = '';
  if (isClosed) {
    closedStep = `
      <div class="stepper-step completed">
        <div class="stepper-circle" style="background:#475569;border-color:#475569;">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        </div>
        <div class="stepper-label" style="color:#475569;">Closed</div>
      </div>
    `;
  }

  return `<div class="stepper-container">${steps}${closedStep}</div>`;
}
