const datePicker = document.getElementById("datePicker");
const qaContainer = document.getElementById("qaContainer");
let gkData = {};

fetch("data.json")
  .then(res => res.json())
  .then(data => gkData = data);

datePicker.addEventListener("change", () => {
  const selectedDate = datePicker.value;
  qaContainer.innerHTML = "";

  if (gkData[selectedDate]) {
    gkData[selectedDate].forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="question">প্রশ্ন: ${item.question}</div>
        <div class="answer">উত্তর: ${item.answer}</div>
        <div class="explanation">ব্যাখ্যা: ${item.explanation}</div>
      `;
      qaContainer.appendChild(card);
    });
  } else {
    qaContainer.innerHTML = "<p>এই তারিখে কিছুই পাওয়া যায়নি।</p>";
  }
});

// সার্চ সাবমিট করলে results.html-এ রিডাইরেক্ট
document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const keyword = document.getElementById("searchInput").value.trim();
  if (keyword) {
    window.open(`results.html?search=${encodeURIComponent(keyword)}`, "_blank");
  }
});