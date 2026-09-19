const RECIPIENT = 'magebyyouness@gmail.com';

/**
 * The form has no backend — it composes a mailto: and hands off to the
 * visitor's mail client. Validation happens here rather than via `required`
 * so the message can be specific, and the form stays usable if the handoff
 * silently fails (some browsers block mailto:).
 */
export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const note = document.getElementById('formNote');
  const submit = document.getElementById('submitBtn');

  const say = (message, isError) => {
    if (!note) return;
    note.textContent = message;
    note.classList.toggle('is-error', Boolean(isError));
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (!name || !email || !message) {
      say('Please fill in all three fields.', true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      say('That email address looks incomplete.', true);
      return;
    }

    const subject = encodeURIComponent(`Contract inquiry from ${name}`);
    const body = encodeURIComponent(
      `Hi Youness,\n\n${message}\n\nBest,\n${name}\n${email}`
    );

    window.location.href = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`;
    say('Opening your email client… if nothing happens, write to ' + RECIPIENT, false);
    if (submit) submit.disabled = true;
  });
}
