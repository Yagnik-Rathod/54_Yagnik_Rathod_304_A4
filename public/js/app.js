// public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.mark-input');
  if (inputs.length === 0) return;

  function calc() {
    const math = parseFloat(document.getElementById('math').value || 0);
    const science = parseFloat(document.getElementById('science').value || 0);
    const english = parseFloat(document.getElementById('english').value || 0);

    const total = (Number.isFinite(math) ? math : 0) + (Number.isFinite(science) ? science : 0) + (Number.isFinite(english) ? english : 0);
    const percent = total === 0 ? 0 : (total / 3);

    document.getElementById('total').value = total;
    document.getElementById('percent').value = percent.toFixed(2);
  }

  inputs.forEach(i => i.addEventListener('input', calc));
  calc();
});
