// Button Status
const buttonsStatus = document.querySelectorAll("[button-status]");
if (buttonsStatus.length > 0) {
    let url = new URL(window.location.href);
    buttonsStatus.forEach((button) => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status");

            if (status) {
                url.searchParams.set("status", status);
            } else {
                url.searchParams.delete("status");
            }

            window.location.href = url.href;
        });
    });
}
// End Button Status

// Form Search
const formSearch = document.querySelector("#form-search");
if (formSearch) {
    let url = new URL(window.location.href);

    formSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        const keyword = e.target.elements.keyword.value;

        if (keyword) {
            url.searchParams.set("keyword", keyword);
        } else {
            url.searchParams.delete("keyword");
        }

        window.location.href = url.href;
    });
}
// End Form Search

// Show Alert
const showAlert = document.querySelector("[show-alert]");
if (showAlert) {
    const time = parseInt(showAlert.getAttribute("data-time")) || 3000;
    const closeAlert = showAlert.querySelector("[close-alert]");

    setTimeout(() => {
        showAlert.classList.add("alert-hidden");
    }, time);

    if (closeAlert) {
        closeAlert.addEventListener("click", () => {
            showAlert.classList.add("alert-hidden");
        });
    }
}
// End Show Alert

// Upload Image
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
    const uploadImageInput = document.querySelector("[upload-image-input]");
    const uploadImagePreview = document.querySelector("[upload-image-preview]");

    if (uploadImageInput && uploadImagePreview) {
        uploadImageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                uploadImagePreview.src = URL.createObjectURL(file);
            }
        });
    }
}
// End Upload Image

// Sort
const sort = document.querySelector("[sort]");
if (sort) {
    let url = new URL(window.location.href);

    const select = sort.querySelector("[sort-select]");
    if (select) {
        select.addEventListener("change", () => {
            const [sortKey, sortValue] = select.value.split("-");

            if (sortKey && sortValue) {
                url.searchParams.set("sortKey", sortKey);
                url.searchParams.set("sortValue", sortValue);

                window.location.href = url.href;
            }
        });

        const defaultSortKey = url.searchParams.get("sortKey");
        const defaultSortValue = url.searchParams.get("sortValue");

        if (defaultSortKey && defaultSortValue) {
            const optionSelected = select.querySelector(
                `option[value="${defaultSortKey}-${defaultSortValue}"]`
            );
            if (optionSelected) {
                optionSelected.selected = true;
            }
        }
    }

    const buttonClear = sort.querySelector("[sort-clear]");
    if (buttonClear) {
        buttonClear.addEventListener("click", () => {
            url.searchParams.delete("sortKey");
            url.searchParams.delete("sortValue");

            window.location.href = url.href;
        });
    }
}
// End Sort

// Xóa bản ghi
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
    const formDeleteItem = document.querySelector("#form-delete-item");

    if (formDeleteItem) {
        const path = formDeleteItem.getAttribute("data-path");

        buttonsDelete.forEach((button) => {
            button.addEventListener("click", () => {
                const isConfirm = confirm("Bạn có chắc muốn xóa bản ghi này không?");

                if (isConfirm) {
                    const id = button.getAttribute("data-id");
                    const action = `${path}/${id}?_method=DELETE`;

                    formDeleteItem.action = action;
                    formDeleteItem.submit();
                }
            });
        });
    }
}
// End Xóa bản ghi