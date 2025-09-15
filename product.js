// product.js
// Handles product storage and display using localStorage

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');
    const productList = document.getElementById('productList');


    function getProducts() {
        return JSON.parse(localStorage.getItem('products') || '[]');
    }

    function saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function renderProducts() {
        const products = getProducts();
        productList.innerHTML = '';
        if (products.length === 0) {
            productList.innerHTML = '<p>No products added yet.</p>';
            return;
        }
        products.forEach((product, idx) => {
            const div = document.createElement('div');
            div.className = 'product-item';
            div.innerHTML = `
                <span><h3>${product.name} (Count: ${product.count})</h3></span>
                <span class="product-actions">
                    <button class="edit-btn" data-idx="${idx}">Edit</button>
                    <button class="delete-btn" data-idx="${idx}">Delete</button>
                </span>
            `;
            productList.appendChild(div);
        });

        // Attach event listeners for edit and delete
        productList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'), 10);
                const products = getProducts();
                products.splice(idx, 1);
                saveProducts(products);
                renderProducts();
            });
        });
        productList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'), 10);
                const products = getProducts();
                const product = products[idx];
                // Fill form with product data for editing
                document.getElementById('productName').value = product.name;
                document.getElementById('productCount').value = product.count;
                // Remove the product being edited
                products.splice(idx, 1);
                saveProducts(products);
                renderProducts();
            });
        });
    }


    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('productName').value.trim();
        const count = parseInt(document.getElementById('productCount').value, 10);
        if (!name || isNaN(count) || count < 1) return;
        let products = getProducts();
        if (products.length >= 6) {
            alert('You can only add up to 6 products.');
            return;
        }
        // Find the lowest available id from 1-6
        const usedIds = products.map(p => p.id);
        let id = 1;
        while (usedIds.includes(id) && id <= 6) id++;
        products.push({ id, name, count });
        saveProducts(products);
        form.reset();
        renderProducts();
    });

    renderProducts();
});
