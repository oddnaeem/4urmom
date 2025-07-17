const datePicker = document.getElementById("datePicker");
const qaContainer = document.getElementById("qaContainer");
const searchBox = document.getElementById("searchBox");
const searchClearBtn = document.getElementById("searchClearBtn");
const searchBtn = document.getElementById("searchBtn");

let gkData = {};

// ডেটা লোড
fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    gkData = data;
  })
  .catch((err) => {
    console.error("ডেটা লোড করতে সমস্যা হয়েছে:", err);
    qaContainer.innerHTML = `<p>ডেটা লোড করতে সমস্যা হয়েছে।</p>`;
  });

// তারিখ সিলেক্ট করলে প্রশ্নোত্তর দেখানো
datePicker.addEventListener("change", () => {
  const selectedDate = datePicker.value;
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

// সার্চ বাটন দেখানো/লুকানো
searchBox.addEventListener("input", () => {
  if (searchBox.value.trim().length > 0) {
    searchClearBtn.style.display = "block";
  } else {
    searchClearBtn.style.display = "none";
  }
});

// ক্লিয়ার বাটন ক্লিক করলে
searchClearBtn.addEventListener("click", () => {
  searchBox.value = "";
  searchClearBtn.style.display = "none";
  searchBox.focus();
});

// সার্চ বাটন ক্লিক ইভেন্ট
searchBtn.addEventListener("click", () => {
  const keyword = searchBox.value.trim();
  if (keyword.length === 0) {
    alert("অনুগ্রহ করে সার্চ বক্সে কিছু লিখুন।");
    return;
  }
  // রিডাইরেক্ট: সার্চ কীওয়ার্ড পাঠানো হচ্ছে results.html এ
  window.location.href = `results.html?search=${encodeURIComponent(keyword)}`;
});