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

// Add post interactions from one shared script so new posts receive them too.
document.querySelectorAll('article.blog-post').forEach(article => {
  const title = article.querySelector('h2')?.textContent.trim() || document.title;
  const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
  const postKey = `suvra-liked:${window.location.pathname}`;
  const interactions = document.createElement('section');
  interactions.className = 'post-interactions';
  interactions.setAttribute('aria-label', 'Post interactions');
  interactions.innerHTML = `
    <div class="post-action-bar">
      <button class="post-like-button" type="button" aria-pressed="false">
        <span aria-hidden="true">&#128077;</span>
        <span class="post-like-label">Like this post</span>
      </button>
      <div class="post-share" aria-label="Share this post">
        <span class="post-share-label">Share</span>
        <a class="post-share-link" data-share="x" target="_blank" rel="noopener noreferrer" aria-label="Share on X">X</a>
        <a class="post-share-link" data-share="linkedin" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">in</a>
        <a class="post-share-link" data-share="facebook" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">f</a>
        <a class="post-share-link post-share-whatsapp" data-share="whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">WhatsApp</a>
        <button class="post-share-link post-copy-link" type="button">Copy link</button>
      </div>
    </div>
    <div class="post-comments">
      <h3>Comments</h3>
      <p>Join the conversation using your GitHub account.</p>
      <div class="post-comments-thread"></div>
    </div>`;
  article.appendChild(interactions);

  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedTitle = encodeURIComponent(title);
  const shareUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
  };
  interactions.querySelectorAll('[data-share]').forEach(link => {
    link.href = shareUrls[link.dataset.share];
  });

  const likeButton = interactions.querySelector('.post-like-button');
  const likeLabel = interactions.querySelector('.post-like-label');
  function setLiked(liked) {
    likeButton.setAttribute('aria-pressed', String(liked));
    likeLabel.textContent = liked ? 'Liked' : 'Like this post';
  }
  try { setLiked(localStorage.getItem(postKey) === 'true'); } catch (_) {}
  likeButton.addEventListener('click', () => {
    const liked = likeButton.getAttribute('aria-pressed') !== 'true';
    setLiked(liked);
    try { localStorage.setItem(postKey, String(liked)); } catch (_) {}
  });

  const copyButton = interactions.querySelector('.post-copy-link');
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      copyButton.textContent = 'Copied!';
    } catch (_) {
      window.prompt('Copy this link:', canonicalUrl);
    }
    window.setTimeout(() => { copyButton.textContent = 'Copy link'; }, 2000);
  });

  const comments = document.createElement('script');
  comments.src = 'https://utteranc.es/client.js';
  comments.async = true;
  comments.crossOrigin = 'anonymous';
  comments.setAttribute('repo', 'suvrazastrovision/suvrazastrovision.github.io');
  comments.setAttribute('issue-term', 'pathname');
  comments.setAttribute('label', 'comment');
  comments.setAttribute('theme', root.dataset.theme === 'light' ? 'github-light' : 'github-dark');
  interactions.querySelector('.post-comments-thread').appendChild(comments);
});
