const params = new URLSearchParams(window.location.search);
const id = params.get('id');

fetch('../data.json')
  .then(res => res.json())
  .then(data => {
    const [date, index] = id.split('_');
    const question = data[date]?.[index];
    if (question) {
      document.getElementById('questionDetail').innerHTML = `
        <h4>${question.question}</h4>
        <p><strong>Answer:</strong> ${question.answer}</p>
        <p><strong>Explanation:</strong> ${question.explanation || 'No explanation available.'}</p>
      `;
    }
  });