// Painéis

let dialogClose = null;

// Abre ou fecha um painel
function setModal(id, open) {
  const m = document.getElementById(id);
  m.classList.toggle('open', open);
  m.setAttribute('aria-hidden', String(!open));
  if (open) mouseWatering = false;
}

// Popup de confirmação
function confirmDialog({ title, text, ok = 'apagar', cancel = 'cancelar' }) {
  const d = document.getElementById('dialog');
  const okBtn = document.getElementById('dialogOk');
  const cancelBtn = document.getElementById('dialogCancel');
  document.getElementById('dialogTitle').textContent = title;
  document.getElementById('dialogText').textContent = text;
  okBtn.textContent = ok;
  cancelBtn.textContent = cancel;
  const previous = document.activeElement;

  return new Promise((resolve) => {
    const close = (value) => {
      d.classList.remove('open');
      d.setAttribute('aria-hidden', 'true');
      okBtn.onclick = cancelBtn.onclick = d.onclick = null;
      dialogClose = null;
      if (previous && previous.focus) previous.focus();
      resolve(value);
    };
    dialogClose = close;
    okBtn.onclick = () => close(true);
    cancelBtn.onclick = () => close(false);
    d.onclick = (e) => { if (e.target === d) close(false); };
    d.classList.add('open');
    d.setAttribute('aria-hidden', 'false');
    cancelBtn.focus();
  });
}
