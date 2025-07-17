let gkData = {};
const params = new URLSearchParams(window.location.search);
const searchQuery = params.get("search")?.trim() || "";
const resultsContainer = document.getElementById("resultsContainer");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
searchInput.value = searchQuery;

const RESULTS_PER_PAGE = 10;
let filteredResults = [];
let currentPage = 1;

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    const allEntries = Object.values(data).flat();
    filteredResults = allEntries.filter(item =>
      item.question.includes(searchQuery) || item.answer.includes(searchQuery)
    );
    renderPage();
  });

function highlight(text) {
  const pattern = new RegExp(`(${searchQuery})`, "gi");
  return text.replace(pattern, `<span class="highlight">$1</span>`);
}

function renderPage() {
  resultsContainer.innerHTML = "";
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredResults.length / RESULTS_PER_PAGE);
  const start = (currentPage - 1) * RESULTS_PER_PAGE;
  const pageItems = filteredResults.slice(start, start + RESULTS_PER_PAGE);

  if (pageItems.length === 0) {
    resultsContainer.innerHTML = `<div class="alert alert-danger">কোনও ফলাফল পাওয়া যায়নি।</div>`;
    return;
  }

  pageItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "card mb-3 p-3";
    card.innerHTML = `
      <h5>❓ প্রশ্ন: ${highlight(item.question)}</h5>
      <p>✔️ উত্তর: ${highlight(item.answer)}</p>
      <small>ℹ️ ব্যাখ্যা: ${highlight(item.explanation)}</small>
    `;
    resultsContainer.appendChild(card);
  });

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${i === currentPage ? "btn-dark" : "btn-outline-primary"}`;
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderPage();
    };
    pagination.appendChild(btn);
  }
}

document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const keyword = document.getElementById("searchInput").value.trim();
  if (keyword) {
    window.location.href = `results.html?search=${encodeURIComponent(keyword)}`;
  }
});