// Versioned so the dark-first design becomes the default for returning visitors too.
const themeKey = 'suvra-theme-v2';
const root = document.documentElement;

function preferredTheme() {
  try {
    const savedTheme = localStorage.getItem(themeKey);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch (_) {}
  return 'dark';
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const isDark = theme === 'dark';
  button.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  button.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  button.setAttribute('aria-pressed', String(isDark));
  button.querySelector('.theme-toggle-icon').textContent = isDark ? '☀' : '☾';
}

applyTheme(preferredTheme());

const navigation = document.querySelector('.nav');
if (navigation) {
  const button = document.createElement('button');
  button.className = 'theme-toggle';
  button.type = 'button';
  button.innerHTML = '<span class="theme-toggle-icon" aria-hidden="true"></span>';
  button.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try { localStorage.setItem(themeKey, nextTheme); } catch (_) {}
  });
  navigation.appendChild(button);
  applyTheme(root.dataset.theme);
}

document.querySelector('.menu')?.addEventListener('click', e => {
  const links = document.querySelector('.links');
  const isOpen = links.classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', isOpen);
});

// Ask before following links explicitly marked for visitor confirmation.
document.querySelectorAll('a[data-confirm-visit]').forEach(link => {
  link.addEventListener('click', event => {
    if (!window.confirm(link.dataset.confirmVisit)) {
      event.preventDefault();
    }
  });
});
