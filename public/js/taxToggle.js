document.addEventListener("DOMContentLoaded", () => {
  let taxSwitch = document.getElementById("switchCheckDefault");
  if (!taxSwitch) return;
  taxSwitch.addEventListener("click", () => {
    const taxInfo = document.getElementsByClassName("tax-info");
    for (info of taxInfo) {
      info.style.display = info.style.display === "inline" ? "none" : "inline";
    }
  });
});
