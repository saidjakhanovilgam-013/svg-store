// Interaktiv SVG prevyu - Fon rangini o'zgartirish
function changePreviewBg(color) {
  const previewBox = document.getElementById('svg-preview-box');
  if (previewBox) {
    previewBox.style.backgroundColor = color;
  }
}

// Qidiruv inputini kuzatish
const searchInput = document.getElementById('search-input');
if (searchInput) {
  let timeout = null;
  searchInput.addEventListener('keyup', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const query = searchInput.value.trim();
      if (query.length > 2 || query.length === 0) {
        window.location.href = `/shop?q=${encodeURIComponent(query)}`;
      }
    }, 500);
  });
}