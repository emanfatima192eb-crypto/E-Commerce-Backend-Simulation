
const products = [
    {
        id: 1,
        name: "Laptop",
        price: 120000,
        stock: 5,
        category: "Electronics"
    },
    {
        id: 2,
        name: "Headphones",
        price: 5000,
        stock: 10,
        category: "Electronics"
    },
    {
        id: 3,
        name: "Keyboard",
        price: 3000,
        stock: 8,
        category: "Accessories"
    },
    {
        id: 4,
        name: "Mouse",
        price: 1500,
        stock: 15,
        category: "Accessories"
    },
    {
        id: 5,
        name: "Monitor",
        price: 35000,
        stock: 3,
        category: "Electronics"
    }
];
let cart = [];
let discount = 0;
let orders = [];
let checkoutInProgress = false;
function applyCoupon() {
    const couponCode = document.getElementById("couponInput").value.toUpperCase();

    const subtotal = cart.reduce(function(total, product) {
        return total + (product.price * product.quantity);
    }, 0);

    if (couponCode === "SAVE10") {
        discount = subtotal * 0.10;
    }
    else if (couponCode === "SAVE20") {
        discount = subtotal * 0.20;
    }
    else {
        discount = 0;
        document.getElementById("couponMessage").textContent =
            "Invalid coupon code!";
    }

    if (couponCode === "SAVE10" || couponCode === "SAVE20") {
        document.getElementById("couponMessage").textContent =
            "Coupon applied successfully!";
    }

    document.getElementById("discountAmount").textContent =
        "Discount: " + discount;

    console.log("Coupon Code:", couponCode);
    console.log("Discount Amount:", discount);
    const tax = (subtotal - discount) * 0.05;

document.getElementById("taxAmount").textContent =
    "Tax: " + tax;

console.log("Tax Amount:", tax);
const finalAmount = subtotal - discount + tax;

document.getElementById("finalAmount").textContent =
    "Final Amount: " + finalAmount;

console.log("Final Checkout Amount:", finalAmount);
}
async function placeOrder() {
    if (checkoutInProgress) {
        return;
    }

    checkoutInProgress = true;

    try {
        if (cart.length === 0) {
            throw new Error("Your cart is empty!");
        }

        const subtotal = cart.reduce(function(total, product) {
            return total + (product.price * product.quantity);
        }, 0);

        const validDiscount = Math.min(discount, subtotal);

        cart.forEach(function(cartItem) {
            const product = products.find(function(item) {
                return item.id === cartItem.id;
            });

            if (!product || cartItem.quantity > product.stock) {
                throw new Error("Insufficient stock for " + cartItem.name);
            }
        });

        document.getElementById("orderMessage").textContent =
            "Processing your order...";

        await new Promise(function(resolve) {
            setTimeout(resolve, 1000);
        });

        const tax = (subtotal - validDiscount) * 0.05;
        const finalAmount = subtotal - validDiscount + tax;

        const orderId = "ORD-" + Date.now();

        const order = {
            id: orderId,
            products: cart.map(function(item) {
                return { ...item };
            }),
            subtotal: subtotal,
            discount: validDiscount,
            tax: tax,
            finalAmount: finalAmount,
            status: "Placed"
        };

        cart.forEach(function(cartItem) {
            const product = products.find(function(item) {
                return item.id === cartItem.id;
            });

            product.stock -= cartItem.quantity;
        });

        orders.push(order);
        document.getElementById("orderMessage").textContent =
            "Order Placed Successfully! Order ID: " + orderId;

        displayOrderSummary(order);
        displayOrderHistory();
        displayCart();
        displayProducts(products);

        cart = [];
        discount = 0;

        displayCart();

        console.log("New Order:", order);
        console.log("Updated Product Stock:", products);
        console.log("All Orders:", orders);

    } catch (error) {
        document.getElementById("orderMessage").textContent =
            error.message;

        console.error("Checkout Error:", error);

    } finally {
        checkoutInProgress = false;
    }
}
function displayOrderSummary(order) {
    const orderSummary = document.getElementById("orderSummary");

    let productDetails = "";

    order.products.forEach(function(product) {
        productDetails += `
            <p>${product.name} - Quantity: ${product.quantity}
            - Price: ${product.price}</p>
        `;
    });

    orderSummary.innerHTML = `
        <h3>Order ID: ${order.id}</h3>
        ${productDetails}
        <p>Subtotal: ${order.subtotal}</p>
        <p>Discount: ${order.discount}</p>
        <p>Tax: ${order.tax}</p>
        <p>Final Amount: ${order.finalAmount}</p>
        <p>Status: ${order.status}</p>
    `;

    console.log("Order Summary:", order);
}
function displayOrderHistory() {
    const orderHistory = document.getElementById("orderHistory");

    orderHistory.innerHTML = "";

    orders.forEach(function(order) {
        let productDetails = "";

        order.products.forEach(function(product) {
            productDetails += `
                <p>${product.name} - Quantity: ${product.quantity}</p>
            `;
        });

        orderHistory.innerHTML += `
            <div>
                <h3>Order ID: ${order.id}</h3>
                ${productDetails}
                <p>Final Amount: ${order.finalAmount}</p>
                <p>Status: ${order.status}</p>

                ${order.status === "Placed" ?
                    `<button onclick="cancelOrder('${order.id}')">
                        Cancel Order
                    </button>` : ""}
            </div>
        `;
    });

    console.log("Order History:", orders);
}
function cancelOrder(orderId) {
    const order = orders.find(function(item) {
        return item.id === orderId;
    });

    if (!order || order.status !== "Placed") {
        console.log("Order cannot be cancelled.");
        return;
    }

    order.products.forEach(function(cartItem) {
        const product = products.find(function(item) {
            return item.id === cartItem.id;
        });

        if (product) {
            product.stock += cartItem.quantity;
        }
    });

    order.status = "Cancelled";

    document.getElementById("orderMessage").textContent =
        "Order Cancelled Successfully!";

    displayOrderSummary(order);
    displayOrderHistory();
    displayProducts(products);

    console.log("Cancelled Order:", order);
    console.log("Restored Product Stock:", products);
}
console.log("Shopping Cart:", cart);
localStorage.setItem("cart", JSON.stringify(cart));
const productList = document.getElementById("productList");
const cartList = document.getElementById("cartList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortPrice = document.getElementById("sortPrice");

function displayProducts(productArray) {
    productList.innerHTML = "";

    productArray.forEach(function(product) {
        productList.innerHTML += `
            <div>
                <h2>${product.name}</h2>
                <p>Price: ${product.price}</p>
                <p>Stock: ${product.stock}</p>
                <p>Category: ${product.category}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
    });

    console.log("Displayed Products:", productArray);
}
function displayCart() {
    cartList.innerHTML = "";

    cart.forEach(function(product) {
        cartList.innerHTML += `
            <div>
                <h3>${product.name}</h3>
                <p>Price: ${product.price}</p>
                <p>Quantity: ${product.quantity}</p>
<button onclick="changeQuantity(${product.id}, 1)">+</button>
<button onclick="changeQuantity(${product.id}, -1)">-</button>
<button onclick="removeFromCart(${product.id})">Remove</button>
            </div>
        `;
    });
const subtotal = cart.reduce(function(total, product) {
    return total + (product.price * product.quantity);
}, 0);
discount = 0;

const tax = subtotal * 0.05;
const finalAmount = subtotal + tax;

document.getElementById("discountAmount").textContent =
    "Discount: " + discount;

document.getElementById("taxAmount").textContent =
    "Tax: " + tax;

document.getElementById("finalAmount").textContent =
    "Final Amount: " + finalAmount;

console.log("Discount:", discount);
console.log("Tax:", tax);
console.log("Final Amount:", finalAmount);
document.getElementById("cartSubtotal").textContent =
    "Subtotal: " + subtotal;
const totalItems = cart.reduce(function(total, product) {
    return total + product.quantity;
}, 0);

const uniqueProducts = cart.length;

document.getElementById("totalItems").textContent =
    "Total Items: " + totalItems;

document.getElementById("uniqueProducts").textContent =
    "Unique Products: " + uniqueProducts;

console.log("Total Cart Items:", totalItems);
console.log("Unique Products:", uniqueProducts);
console.log("Cart Subtotal:", subtotal);
    console.log("Shopping Cart:", cart);
}
function addToCart(productId) {
    const selectedProduct = products.find(function(product) {
        return product.id === productId;
    });

    const existingProduct = cart.find(function(product) {
        return product.id === productId;
    });

    if (existingProduct) {
        if (existingProduct.quantity >= selectedProduct.stock) {
            alert("Sorry! Not enough stock available.");
            return;
        }

        existingProduct.quantity++;
    } else {
        if (selectedProduct.stock <= 0) {
            alert("Product is out of stock!");
            return;
        }

        cart.push({
            ...selectedProduct,
            quantity: 1
        });
    }

    displayCart();
}
function changeQuantity(productId, change) {
    const selectedProduct = cart.find(function(product) {
        return product.id === productId;
    });

    if (!selectedProduct) {
        return;
    }

    const newQuantity = selectedProduct.quantity + change;

    if (newQuantity > selectedProduct.stock) {
        alert("Sorry! Not enough stock available.");
        return;
    }

    if (newQuantity < 1) {
        alert("Minimum quantity is 1.");
        return;
    }

    selectedProduct.quantity = newQuantity;

    displayCart();
}
function removeFromCart(productId) {
    cart = cart.filter(function(product) {
        return product.id !== productId;
    });

    displayCart();

    console.log("Product Removed. Updated Cart:", cart);
}

displayProducts(products);

function applyFilters() {
    const searchValue = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    const filteredProducts = products.filter(function(product) {
        const matchesSearch = product.name.toLowerCase().includes(searchValue);
       
        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;
            
        return matchesSearch && matchesCategory;
    });
    const sortValue = sortPrice.value;
 
    if (sortValue === "lowToHigh") {
        filteredProducts.sort(function(a, b) {
            return a.price - b.price;
        });
    }
    else if (sortValue === "highToLow") {
        filteredProducts.sort(function(a, b) {
            return b.price - a.price;
        });
    }

    displayProducts(filteredProducts);
}

categoryFilter.addEventListener("input",applyFilters);
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
sortPrice.addEventListener("change", applyFilters);
console.log("All Products:", products);
