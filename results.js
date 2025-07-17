function highlight(text, keyword) {
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function getAllEntries(data) {
  return Object.entries(data).flatMap(([date, entries]) => 
    entries.map(entry => ({ date, ...entry }))
  );
}

function renderResults(results, keyword, page = 1) {
  const resultsPerPage = 10;
  const start = (page - 1) * resultsPerPage;
  const paginated = results.slice(start, start + resultsPerPage);
  const container = document.getElementById("searchResults");
  const pagination = document.getElementById("pagination");

  container.innerHTML = "";
  pagination.innerHTML = "";

  if (!results.length) {
    container.innerHTML = "<p>কোনো মিল পাওয়া যায়নি।</p>";
    return;
  }

  paginated.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div><strong>${item.date}</strong></div>
      <div>❓ প্রশ্ন: ${highlight(item.question, keyword)}</div>
      <div>✔️ উত্তর: ${highlight(item.answer, keyword)}</div>
      <div>ℹ️ ব্যাখ্যা: ${highlight(item.explanation, keyword)}</div>
    `;
    container.appendChild(card);
  });

  const totalPages = Math.ceil(results.length / resultsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "pagination-button";
    if (i === page) btn.classList.add("active");
    btn.onclick = () => renderResults(results, keyword, i);
    pagination.appendChild(btn);
  }
}

const params = new URLSearchParams(window.location.search);
const searchQuery = params.get("search");

if (searchQuery) {
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      const all = getAllEntries(data);
      const results = all.filter(entry =>
        entry.question.includes(searchQuery) ||
        entry.answer.includes(searchQuery) ||
        entry.explanation.includes(searchQuery)
      );
      renderResults(results, searchQuery);
    });
}