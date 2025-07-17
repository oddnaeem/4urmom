const datePicker = document.getElementById("datePicker");
const qaContainer = document.getElementById("qaContainer");

let gkData = {};

fetch("data.json")
  .then(response => response.json())
  .then(data => gkData = data);

datePicker.addEventListener("change", () => {
  const selectedDate = datePicker.value;
  qaContainer.innerHTML = "";

  if (gkData[selectedDate]) {
    gkData[selectedDate].forEach(item => {
      const card = document.createElement("div");
      card.className = "card mb-3 p-3";
      card.innerHTML = `
        <h5>❓ প্রশ্ন: ${item.question}</h5>
        <p>✔️ উত্তর: ${item.answer}</p>
        <small>ℹ️ ব্যাখ্যা: ${item.explanation}</small>
      `;
      qaContainer.appendChild(card);
    });
  } else {
    qaContainer.innerHTML = `<div class="alert alert-warning">এই তারিখে কোনো তথ্য নেই।</div>`;
  }
});