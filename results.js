// get search keyword from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || "";
}

const resultsContainer = document.getElementById("resultsContainer");
const pagination = document.getElementById("pagination");

const gkDataUrl = "data.json";
const itemsPerPage = 10;

let allResults = [];
let currentPage = 1;
let searchKeyword = getQueryParam("search").trim().toLowerCase();

function highlightText(text, keyword) {
  if (!keyword) return text;
  // Escape regex special chars in keyword
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedKeyword})`, "gi");
  return text.replace(regex, `<mark>$1</mark>`);
}

function renderResults(page = 1) {
  resultsContainer.innerHTML = "";
  pagination.innerHTML = "";

  if (allResults.length === 0) {
    resultsContainer.innerHTML = `<p>কোনো ফলাফল পাওয়া যায়নি।</p>`;
    return;
  }

  currentPage = page;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, allResults.length);
  const pageItems = allResults.slice(startIndex, endIndex);

  pageItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="question">❓ প্রশ্ন: ${highlightText(item.question, searchKeyword)}</div>
      <div class="answer">✔️ উত্তর: ${highlightText(item.answer, searchKeyword)}</div>
      <div class="explanation">ℹ️ ব্যাখ্যা: ${highlightText(item.explanation, searchKeyword)}</div>
    `;

    resultsContainer.appendChild(card);
  });

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(allResults.length / itemsPerPage);

  if (totalPages <= 1) return;

  // Prev button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "« Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      renderResults(currentPage - 1);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  });
  pagination.appendChild(prevBtn);

  // Page numbers (simple: show 1 to totalPages)
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = i === currentPage ? "active" : "";
    pageBtn.addEventListener("click", () => {
      renderResults(i);
      window.scrollTo({top: 0, behavior: 'smooth'});
    });
    pagination.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next »";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      renderResults(currentPage + 1);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  });
  pagination.appendChild(nextBtn);
}

// Load data and filter by search keyword
fetch(gkDataUrl)
  .then(res => res.json())
  .then(data => {
    allResults = [];

    for (const date in data) {
      data[date].forEach(item => {
        const combinedText = (item.question + " " + item.answer + " " + item.explanation).toLowerCase();
        if (combinedText.includes(searchKeyword)) {
          allResults.push(item);
        }
      });
    }

    renderResults(1);
  })
  .catch(() => {
    resultsContainer.innerHTML = `<p>ডেটা লোড করতে সমস্যা হয়েছে।</p>`;
  });