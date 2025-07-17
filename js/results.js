const params = new URLSearchParams(window.location.search);
const searchTerm = params.get('search')?.toLowerCase() || '';
const resultsPerPage = 10;
let currentPage = 1;
let allResults = [];

function highlight(text, keyword) {
  const re = new RegExp(\`(\${keyword})\`, 'gi');
  return text.replace(re, '<span class="highlight">$1</span>');
}

function renderPage(page) {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = '';
  const start = (page - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const pageResults = allResults.slice(start, end);

  pageResults.forEach(({ q, id }) => {
    container.innerHTML += `<div class="card">
      <div class="card-body">
        <a href="question.html?id=${id}" class="text-decoration-none">${highlight(q.question, searchTerm)}</a>
      </div>
    </div>`;
  });

  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  const totalPages = Math.ceil(allResults.length / resultsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += \`<button class="btn btn-sm btn-primary me-1 \${i === page ? 'active' : ''}" onclick="renderPage(\${i})">\${i}</button>\`;
  }
}

fetch('js/data.json')
  .then(res => res.json())
  .then(data => {
    Object.keys(data).forEach(date => {
      data[date].forEach((q, i) => {
        const id = \`\${date}_\${i}\`;
        if (q.question.toLowerCase().includes(searchTerm)) {
          allResults.push({ q, id });
        }
      });
    });
    renderPage(currentPage);
  });

document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const query = document.getElementById('searchInput').value.trim();
  if (query) window.location.href = 'results.html?search=' + encodeURIComponent(query);
});
