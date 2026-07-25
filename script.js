const cafeWhatsAppNumber = "201515309139"; 

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let total = 0;
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    checkAuthStatus();

    const darkModeBtn = document.getElementById("darkModeBtn");
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        if(darkModeBtn) darkModeBtn.textContent = "☀️";
    }

    if(darkModeBtn) {
        darkModeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            if (document.body.classList.contains("dark")) {
                localStorage.setItem("theme", "dark");
                darkModeBtn.textContent = "☀️";
            } else {
                localStorage.setItem("theme", "light");
                darkModeBtn.textContent = "🌙";
            }
        });
    }
});

// تحديث حالة زر الدخول/الحساب
function checkAuthStatus() {
    const authBtn = document.getElementById("authBtn");
    if (authBtn) {
        if (currentUser) {
            authBtn.textContent = `👤 ${currentUser.name.split(" ")[0]}`;
            authBtn.href = "profile.html";
        } else {
            authBtn.textContent = "دخول / تسجيل";
            authBtn.href = "login.html";
        }
    }
}

// تسجيل الدخول بدون alerts
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        window.location.href = "profile.html";
    } else {
        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة!");
    }
}

// تسجيل حساب جديد
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const phone = document.getElementById("regPhone").value;
    const address = document.getElementById("regAddress").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    
    if (users.some(u => u.email === email)) {
        alert("هذا البريد الإلكتروني مسجل بالفعل!");
        return;
    }

    const newUser = { name, phone, address, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    window.location.href = "profile.html";
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    window.location.href = "login.html";
}

// فلترة المنيو
function filterMenu(category) {
    const cards = document.querySelectorAll(".card");
    const buttons = document.querySelectorAll(".cat-btn");

    buttons.forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    cards.forEach(card => {
        if (category === "all" || card.getAttribute("data-category") === category) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// إضافة منتج للسلة (تحديث العداد بسلسونة بدون alert)
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// تحديث بيانات السلة
function updateCartUI() {
    const cartList = document.getElementById("cart-list");
    const totalPriceEl = document.getElementById("total-price");
    const cartCountEl = document.getElementById("cartCount");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = totalItems;

    if (!cartList || !totalPriceEl) return;

    cartList.innerHTML = "";
    total = 0;

    if (cart.length === 0) {
        cartList.innerHTML = "<p style='text-align:center;'>السلة فارغة حالياً ☕</p>";
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>${itemTotal} ج.م 
                <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer; margin-right:10px;">✕</button>
            </span>
        `;
        cartList.appendChild(li);
    });

    totalPriceEl.textContent = total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

function checkoutWhatsApp() {
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) return;

    let orderText = `*طلب جديد من موقع Aylé Café ☕*\n\n`;
    orderText += `👤 *العميل:* ${currentUser.name}\n`;
    orderText += `📞 *الهاتف:* ${currentUser.phone || "غير محدد"}\n`;
    orderText += `📍 *العنوان:* ${currentUser.address || "غير محدد"}\n\n`;
    orderText += `📋 *تفاصيل الطلب:*\n`;

    cart.forEach(item => {
        orderText += `- ${item.name} (عدد: ${item.quantity}) = ${item.price * item.quantity} ج.م\n`;
    });

    orderText += `\n💵 *الإجمالي النهائي:* ${total} جنيه مصري`;

    const encodedText = encodeURIComponent(orderText);
    const whatsappURL = `https://wa.me/${cafeWhatsAppNumber}?text=${encodedText}`;

    window.open(whatsappURL, "_blank");
}// الانتقال لصفحة الشراء
function goToCheckout() {
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }
    if (cart.length === 0) {
        alert("السلة فارغة حالياً!");
        return;
    }
    window.location.href = "checkout.html";
}

// إرسال الطلب النهائي مع طريقة الدفع للواتساب
function submitCheckoutOrder(e) {
    e.preventDefault();

    if (cart.length === 0) return;

    const name = document.getElementById("checkoutName").value;
    const phone = document.getElementById("checkoutPhone").value;
    const address = document.getElementById("checkoutAddress").value;
    const payment = document.getElementById("checkoutPayment").value;

    let orderText = `*طلب جديد من موقع Aylé Café ☕*\n\n`;
    orderText += `👤 *العميل:* ${name}\n`;
    orderText += `📞 *الهاتف:* ${phone}\n`;
    orderText += `📍 *العنوان:* ${address}\n`;
    orderText += `💳 *طريقة الدفع:* ${payment}\n\n`;
    orderText += `📋 *تفاصيل الطلب:*\n`;

    cart.forEach(item => {
        orderText += `- ${item.name} (عدد: ${item.quantity}) = ${item.price * item.quantity} ج.م\n`;
    });

    orderText += `\n💵 *الإجمالي النهائي:* ${total} جنيه مصري`;

    // مسح السلة بعد إتمام الطلب
    localStorage.removeItem("cart");
    cart = [];

    const encodedText = encodeURIComponent(orderText);
    const whatsappURL = `https://wa.me/${cafeWhatsAppNumber}?text=${encodedText}`;

    window.open(whatsappURL, "_blank");
    window.location.href = "index.html";
}
