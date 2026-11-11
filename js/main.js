(function () {
  var float = document.querySelector('.wa-float');
  var actions = document.querySelector('.hero .actions');
  if (!float || !actions || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(function (entries) {
    float.classList.toggle('off', entries[0].isIntersecting);
  }).observe(actions);
})();

(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll(
    'section:not(.hero) h2, .section-lead, .intro-grid img, .for-whom, .service, .service-band, .ba, .steps li, .towns li, .faq details, .contact-links, #contact form'
  );

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  targets.forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    var position = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--delay', Math.min(position, 4) * 80 + 'ms');
    el.classList.add('reveal');
    observer.observe(el);
  });
})();

document.querySelectorAll('form[data-netlify]').forEach(function (form, index) {
  if (!form.id) form.id = 'form-' + index;

  var status = form.querySelector('.status');
  var btn = form.querySelector('button[type="submit"]');
  var fields = form.querySelectorAll('input[required], select[required], textarea[required]');

  form.noValidate = true;

  function errorFor(field) {
    var error = field.parentNode.querySelector('.field-error');
    if (!error) {
      error = document.createElement('span');
      error.className = 'field-error';
      error.id = field.name + '-error-' + form.id;
      field.parentNode.appendChild(error);
    }
    return error;
  }

  function check(field) {
    var valid = field.validity.valid;
    if (valid) {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      var old = field.parentNode.querySelector('.field-error');
      if (old) old.remove();
      return true;
    }
    var error = errorFor(field);
    error.textContent = field.validity.typeMismatch ? form.dataset.invalidEmail : form.dataset.required;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', error.id);
    return false;
  }

  fields.forEach(function (field) {
    ['input', 'change'].forEach(function (type) {
      field.addEventListener(type, function () {
        if (field.hasAttribute('aria-invalid')) check(field);
      });
    });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();

    var invalid = Array.prototype.filter.call(fields, function (field) { return !check(field); });
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    status.className = 'status';
    status.textContent = form.dataset.sending;
    btn.disabled = true;

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function (res) {
        if (!res.ok) throw new Error('send failed');
        status.className = 'status ok';
        status.textContent = form.dataset.ok;
        form.reset();
      })
      .catch(function () {
        status.className = 'status err';
        status.textContent = form.dataset.err;
      })
      .then(function () { btn.disabled = false; });
  });
});
