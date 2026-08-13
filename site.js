document.querySelector('.menu')?.addEventListener('click',e=>{const n=document.querySelector('.links');const o=n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)});
