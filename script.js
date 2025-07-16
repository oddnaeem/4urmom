const datePicker = document.getElementById("datePicker");
const qaContainer = document.getElementById("qaContainer");

let gkData = {};

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    gkData = data;
  })
  .catch(error => {
    console.error("ডেটা লোড করতে সমস্যা হয়েছে:", error);
    qaContainer.innerHTML = `<p>ডেটা লোড করতে সমস্যা হয়েছে।</p>`;
  });

datePicker.addEventListener("change", function () {
  const selectedDate = this.value;
  qaContainer.innerHTML = "";

  if (gkData[selectedDate]) {
    gkData[selectedDate].forEach(item => {
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
