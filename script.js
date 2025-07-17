const datePicker = document.getElementById("datePicker");
const qaContainer = document.getElementById("qaContainer");
const searchBox = document.getElementById("searchBox");
const searchClearBtn = document.getElementById("searchClearBtn");

let gkData = {};

// ডেটা লোড করা
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    gkData = data;
  })
  .catch((error) => {
    console.error("ডেটা লোড করতে সমস্যা হয়েছে:", error);
    qaContainer.innerHTML = `<p>ডেটা লোড করতে সমস্যা হয়েছে।</p>`;
  });

// তারিখ সিলেক্ট করলে ফলাফল দেখানো
datePicker.addEventListener("change", function () {
  const selectedDate = this.value;
  qaContainer.innerHTML = "";

  if (gkData[selectedDate]) {
    gkData[selectedDate].forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="question">❓ প্রশ্ন: ${item.question}</div>
        <div class="answer">✔️ উত্তর: ${item.answer}</div>
        <div class="explanation">ℹ️ ব্যাখ্যা: ${item.explanation}</div>
      `;

      qaContainer.appendChild(card);
    });
  } else {
    qaContainer.innerHTML = `<p>এই তারিখে কোনো প্রশ্ন পাওয়া যায়নি।</p>`;
  }
});

// সার্চ বক্স এক্সপ্যান্ড এবং ক্লিয়ার বাটন ফাংশনালিটি
searchBox.addEventListener("input", function () {
  if (this.value.trim().length > 0) {
    searchClearBtn.style.display = "block";
  } else {
    searchClearBtn.style.display = "none";
  }
});

searchClearBtn.addEventListener("click", function () {
  searchBox.value = "";
  searchClearBtn.style.display = "none";
  searchBox.blur();
});

// সার্চ শুরু করা এবং রিডাইরেক্ট করা
function startSearch() {
  const keyword = searchBox.value.trim();
  if (keyword.length > 0) {
    window.location.href = `results.html?search=${encodeURIComponent(keyword)}`;
  }
}