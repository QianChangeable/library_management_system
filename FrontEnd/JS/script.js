// Toggle the visibility of a dropdown menu
const toggleDropdown = (dropdown, menu, isOpen) => {
    dropdown.classList.toggle("open", isOpen)
    // menu.style.height = isopen ? `${menu.scrollHeight}px` : 0;
    menu.style.height = isOpen ? `${menu.scrollHeight}px` : 0;
};
// Close all open dropdowns
const closeAllDropdowns = () => {
    document.querySelectorAll(".dropdown-container.open").forEach(openDropdown => {
        toggleDropdown(openDropdown, openDropdown.querySelector(".dropdown-menu"), false)
    });
};
// Attach click event to all dropdown toggles
document.querySelectorAll(".dropdown-toggle").forEach(dropdownToggle => {
    dropdownToggle.addEventListener("click", e => {
        e.preventDefault();

        const dropdown = e.target.closest(".dropdown-container");
        const menu = dropdown.querySelector(".dropdown-menu");
        const isOpen = dropdown.classList.contains("open");

        // 可选，
        closeAllDropdowns();
        //不允许同时出现两个展开的菜单

        toggleDropdown(dropdown, menu, !isOpen);//Toggle current dropdown visibility
    });
});

// document.querySelector(".sidebar-toggler").addEventListener("click", () => {
//     closeAllDropdowns();

//     document.querySelector(".sidebar").classList.toggle("collapsed");
// });

document.querySelectorAll(".sidebar-toggler,.sidebar-menu-button").forEach(button => {
    button.addEventListener("click", () => {
        closeAllDropdowns();

        document.querySelector(".sidebar").classList.toggle("collapsed");
    })
})

if (window.innerWidth <= 1024)
    document.querySelector(".sidebar").classList.toggle("collapsed");
