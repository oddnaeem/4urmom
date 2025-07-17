const datePicker = document.getElementById("datePicker");
const qaContainer = document.getElementById("qaContainer");

let gkData = {};

fetch("data.json")
  .then(res => res.json())
  .then(data => gkData = data);

datePicker.addEventListener("change", function () {
  const selectedDate = this.value;
  qaContainer.innerHTML = "";
  if (gkData[selectedDate]) {
    gkData[selectedDate].forEach((item, index) => {
      qaContainer.innerHTML += `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">Q: ${item.question}</h5>
            <a href="question.html?id=${selectedDate}_${index}" class="btn btn-outline-primary btn-sm">View Details</a>
          </div>
        </div>
      `;
    });
  } else {
    qaContainer.innerHTML = `<div class="alert alert-warning">No questions found for this date.</div>`;
  }
});