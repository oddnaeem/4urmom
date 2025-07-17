document.getElementById('datePicker').addEventListener('change', function () {
  const selectedDate = this.value;
  fetch('../data.json')
    .then(res => res.json())
    .then(data => {
      const questions = data[selectedDate] || [];
      const container = document.getElementById('questionsContainer');
      container.innerHTML = '';
      questions.forEach((q, i) => {
        container.innerHTML += `<div class="card">
          <div class="card-body">
            <a href="question.html?id=${selectedDate}_${i}" class="text-decoration-none">${q.question}</a>
          </div>
        </div>`;
      });
    });
});

document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const query = document.getElementById('searchInput').value.trim();
  if (query) window.location.href = 'results.html?search=' + encodeURIComponent(query);
});