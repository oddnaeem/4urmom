const qaContainer = document.getElementById("qaContainer");
const pagination = document.getElementById("pagination");
let results = [];
const pageSize = 10;
let currentPage = 1;

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function highlight(text, keyword) {
  const reg = new RegExp(`(${keyword})`, "gi");
  return text.replace(reg, `<span class="highlight">$1</span>`);
}

function displayResults() {
  qaContainer.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const sliced = results.slice(start, end);

  sliced.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="question">${item.question}</div>
      <div class="answer">${item.answer}</div>
      <div class="explanation">${item.explanation}</div>
    `;
    qaContainer.appendChild(card);
  });

  // pagination buttons
  pagination.innerHTML = "";
  const totalPages = Math.ceil(results.length / pageSize);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "pagination-button" + (i === currentPage ? " active" : "");
    btn.onclick = () => {
      currentPage = i;
      displayResults();
    };
    pagination.appendChild(btn);
  }
}

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    const keyword = getQueryParam("search");
    if (!keyword) return;

    document.getElementById("searchInput").value = keyword;

    for (const date in data) {
      data[date].forEach(entry => {
        const combined = `${entry.question} ${entry.answer} ${entry.explanation}`;
        if (combined.toLowerCase().includes(keyword.toLowerCase())) {
          results.push({
            question: highlight(entry.question, keyword),
            answer: highlight(entry.answer, keyword),
            explanation: highlight(entry.explanation, keyword),
          });
        }
      });
    }

    if (results.length === 0) {
      qaContainer.innerHTML = "<p>কোনো ফলাফল পাওয়া যায়নি।</p>";
    } else {
      displayResults();
    }
  });

// সার্চ সাবমিট করলে একই পেজে নতুনভাবে রিলোড করে
document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const keyword = document.getElementById("searchInput").value.trim();
  if (keyword) {
    window.location.href = `results.html?search=${encodeURIComponent(keyword)}`;
  }
});