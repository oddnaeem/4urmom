const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    const [date, index] = id.split("_");
    const question = data[date]?.[index];
    const details = document.getElementById("questionDetails");
    if (question) {
      details.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Q: ${question.question}</h5>
            <p><strong>Answer:</strong> ${question.answer}</p>
            <p><strong>Explanation:</strong> ${question.explanation}</p>
          </div>
        </div>
      `;
    } else {
      details.innerHTML = "<div class='alert alert-danger'>Question not found.</div>";
    }
  });