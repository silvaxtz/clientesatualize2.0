const menu = document.querySelector(".sidebar");
const overlay = document.querySelector(".overlay");
const btn = document.getElementById("menuBtn");

btn.addEventListener("click", () => {

    menu.classList.toggle("show");
    overlay.classList.toggle("show");

});

overlay.addEventListener("click", () => {

    menu.classList.remove("show");
    overlay.classList.remove("show");

});
