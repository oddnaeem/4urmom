const datePicker = document.getElementById("datePicker");
const qaContainer = document.getElementById("qaContainer");
let gkData = {};

fetch("data.json")
  .then(res => res.json())
  .then(data => gkData = data)
  .catch(() => qaContainer.innerHTML = `<p>ডেটা লোড করতে সমস্যা হয়েছে।</p>`);

datePicker.addEventListener("change", () => {
  const selectedDate = datePicker.value;
  qaContainer.innerHTML = "";

  if (gkData[selectedDate]) {
    gkData[selectedDate].forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div>❓ প্রশ্ন: ${item.question}</div>
        <div>✔️ উত্তর: ${item.answer}</div>
        <div>ℹ️ ব্যাখ্যা: ${item.explanation}</div>
      `;
      qaContainer.appendChild(card);
    });
  } else {
    qaContainer.innerHTML = `<p>এই তারিখে কোনো প্রশ্ন পাওয়া যায়নি।</p>`;
  }
});

// সার্চ ফর্ম
document.getElementById("searchForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    window.open(`results.html?search=${encodeURIComponent(query)}`, "_blank");
  }
});

document.getElementById("clearSearch").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
});