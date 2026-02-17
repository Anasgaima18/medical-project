/* ========================================
   Form Validation — Entry page
   Soft validation, Japanese error messages
======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('entry-form');
  if (!form) return;

  initFormSteps(form);
  initFormValidation(form);
});

/* ---- Multi-step form ---- */
function initFormSteps(form) {
  const steps = form.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const nextBtns = form.querySelectorAll('[data-next]');
  const prevBtns = form.querySelectorAll('[data-prev]');
  let current = 0;

  function showStep(index) {
    steps.forEach((step, i) => {
      step.style.display = i === index ? 'block' : 'none';
    });

    progressSteps.forEach((ps, i) => {
      ps.classList.remove('active', 'completed');
      if (i < index) ps.classList.add('completed');
      if (i === index) ps.classList.add('active');
    });

    current = index;
  }

  nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentStep = steps[current];
      if (validateStep(currentStep)) {
        if (current < steps.length - 1) {
          showStep(current + 1);
          window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
        }
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (current > 0) {
        showStep(current - 1);
        window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
      }
    });
  });

  showStep(0);
}

/* ---- Validation ---- */
function validateStep(step) {
  const fields = step.querySelectorAll('[required]');
  let valid = true;

  fields.forEach(field => {
    const group = field.closest('.form-group');
    const error = group?.querySelector('.form-error');

    group?.classList.remove('error');

    if (!field.value.trim()) {
      group?.classList.add('error');
      if (error) error.textContent = 'この項目は必須です';
      valid = false;
    } else if (field.type === 'email' && !isValidEmail(field.value)) {
      group?.classList.add('error');
      if (error) error.textContent = '正しいメールアドレスを入力してください';
      valid = false;
    } else if (field.type === 'tel' && !isValidPhone(field.value)) {
      group?.classList.add('error');
      if (error) error.textContent = '正しい電話番号を入力してください';
      valid = false;
    }
  });

  return valid;
}

function initFormValidation(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const allSteps = form.querySelectorAll('.form-step');
    let allValid = true;

    allSteps.forEach(step => {
      if (!validateStep(step)) allValid = false;
    });

    if (allValid) {
      showSuccessModal();
    }
  });

  // Real-time soft validation
  form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(field => {
    field.addEventListener('blur', () => {
      const group = field.closest('.form-group');
      if (group?.classList.contains('error')) {
        validateStep(field.closest('.form-step'));
      }
    });

    field.addEventListener('input', () => {
      const group = field.closest('.form-group');
      if (group?.classList.contains('error')) {
        group.classList.remove('error');
      }
    });
  });
}

function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) {
    modal.classList.add('active');
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.modal__close')) {
        modal.classList.remove('active');
      }
    });
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\d\-+() ]{10,}$/.test(phone);
}
