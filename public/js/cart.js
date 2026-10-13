document.addEventListener('DOMContentLoaded', () => {
  // Savatchaga qo'shish tugmalari uchun hodisa
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

  addToCartButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const productId = button.dataset.id;

      try {
        const response = await fetch('/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        });

        const data = await response.json();

        if (data.success) {
          // Navbardagi savat saqlagichini yangilash
          const cartBadge = document.getElementById('cart-count');
          if (cartBadge) {
            cartBadge.textContent = data.cartCount;
          }
          alert('Mahsulot savatchaga qo\'shildi!');
        } else {
          alert(data.message || 'Xatolik yuz berdi');
        }
      } catch (error) {
        console.error('Savatga qo\'shishda xatolik:', error);
      }
    });
  });
});

// Savatdan mahsulotni o'chirish
async function removeFromCart(productId) {
  if (!confirm('Ushbu mahsulotni savatdan o\'chirmoqchimisiz?')) return;

  try {
    const response = await fetch(`/cart/remove/${productId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      window.location.reload();
    } else {
      alert('O\'chirishda xatolik yuz berdi.');
    }
  } catch (error) {
    console.error('Xatolik:', error);
  }
}