// Cập nhật số lượng sản phẩm trong giỏ hàng
const inputsQuantity = document.querySelectorAll("input[name='quantity']");
if (inputsQuantity.length > 0) {
    inputsQuantity.forEach(input => {
        input.addEventListener("change", () => {
            const productId = input.getAttribute("item-id"); // hoặc "product-id" tuỳ tên bạn đặt ở Pug
            const quantity = input.value;

            window.location.href = `/cart/update/${productId}/${quantity}`;
        });
    });
}
// Hết Cập nhật số lượng sản phẩm trong giỏ hàng