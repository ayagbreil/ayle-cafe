// رقم الواتساب الخاص بالكافيه (غيريه لرقمك بفرمتة دولية بدون +)
const cafeWhatsAppNumber = "201515309139"; 

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let total = 0;
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// تشغيل الوظائف عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    checkAuthStatus();

    // إعداد زر الوضع الليلي
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

// إدارة حالة تسجيل الدخول
function checkAuthStatus() {
    const authBtn = document.getElementById("authBtn");
    if (authBtn) {
        if (currentUser) {
            authBtn.textContent = `مرحباً، ${currentUser.name.split(" ")[0]} (خروج)`;
            authBtn.href = "#";
            authBtn.onclick = logout;
        } else {
            authBtn.textContent = "دخول / تسجيل";
            authBtn.href = "login.html";
            authBtn.onclick = null;
        }
    }
}

// تسجيل الدخول
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        alert(`تم تسجيل الدخول بنجاح! أهلاً بك يا ${user.name}`);
        window.location.href = "index.html";
    } else {
        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة!");
    }
}

// إنشاء حساب جديد
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

    alert(`تم إنشاء الحساب بنجاح! أهلاً بك يا ${name}`);
    window.location.href = "index.html";
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    alert("تم تسجيل الخروج بنجاح.");
    location.reload();
}

// تصفية المنيو حسب القسم
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

// إضافة منتج للسلة
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    alert(`تمت إضافة ${name} إلى السلة 🛒`);
}

// تحديث واجهة السلة
function updateCartUI() {
    const cartList = document.getElementById("cart-list");
    const totalPriceEl = document.getElementById("total-price");

    if (!cartList || !totalPriceEl) return;

    cartList.innerHTML = "";
    total = 0;

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

// حذف عنصر من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// إتمام الطلب عبر الواتساب
function checkoutWhatsApp() {
    if (!currentUser) {
        alert("من فضلك قم بتسجيل الدخول أولاً لإرسال الطلب!");
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) {
        alert("السلة فارغة، أضف بعض المنتجات أولاً!");
        return;
    }

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
}