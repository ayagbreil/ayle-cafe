// 1. زر العودة لأعلى
const topBtn = document.getElementById("topBtn");

if (topBtn) {
    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            topBtn.style.display = "block";
        } else {
            topBtn.style.display = "none";
        }
    });

    topBtn.onclick = function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };
}

// 2. الوضع الليلي مع حفظ التفضيل (LocalStorage)
const darkBtn = document.getElementById("darkModeBtn");

if (darkBtn) {
    // التأكد من التفضيل المحفوظ سابقاً
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        darkBtn.innerHTML = "☀️";
    }

    darkBtn.onclick = function () {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            darkBtn.innerHTML = "☀️";
            localStorage.setItem("theme", "dark");
        } else {
            darkBtn.innerHTML = "🌙";
            localStorage.setItem("theme", "light");
        }
    };
}

// 3. سلة المشتريات
let cart = [];
let total = 0;

function addToCart(name, price) {
    let item = cart.find(product => product.name === name);

    if (item) {
        item.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    total += price;
    displayCart();
}

function displayCart() {
    const list = document.getElementById("cart-list");
    const totalPriceEl = document.getElementById("total-price");

    if (!list) return;

    list.innerHTML = "";

    cart.forEach((item, index) => {
        list.innerHTML += `
        <li class="cart-item">
            <div>
                <strong>${item.name}</strong><br>
                <span>${item.price * item.quantity} ج.م</span>
            </div>
            <div class="cart-controls">
                <button onclick="decreaseQuantity(${index})">➖</button>
                <span>${item.quantity}</span>
                <button onclick="increaseQuantity(${index})">➕</button>
                <button class="remove-btn" onclick="removeItem(${index})">❌</button>
            </div>
        </li>
        `;
    });

    if (totalPriceEl) {
        totalPriceEl.innerText = total;
    }
}

function increaseQuantity(index) {
    cart[index].quantity++;
    total += cart[index].price;
    displayCart();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        total -= cart[index].price;
    } else {
        removeItem(index);
        return;
    }
    displayCart();
}

function removeItem(index) {
    total -= cart[index].price * cart[index].quantity;
    cart.splice(index, 1);
    displayCart();
}

function checkout() {
    if (cart.length === 0) {
        alert("السلة فارغة، أضف بعض المنتجات أولاً!");
    } else {
        alert("✅ تم إرسال طلبك بنجاح! شكراً لزيارتك Aylé Café ☕");
        cart = [];
        total = 0;
        displayCart();
    }
}