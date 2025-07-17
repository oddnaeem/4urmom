const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get("search")?.toLowerCase() || "";

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    let results = [];
    Object.entries(data).forEach(([date, questions]) => {
      questions.forEach((q, index) => {
        const combined = q.question + " " + q.answer + " " + q.explanation;
        if (combined.toLowerCase().includes(searchTerm)) {
          results.push({ ...q, id: date + "_" + index });
        }
      });
    });

    const resultsPerPage = 10;
    let currentPage = 1;
    const container = document.getElementById("resultsContainer");
    const pagination = document.getElementById("pagination");

    function renderPage(page) {
      container.innerHTML = "";
      const start = (page - 1) * resultsPerPage;
      const end = start + resultsPerPage;
      const pageItems = results.slice(start, end);
      pageItems.forEach(r => {
        const highlighted = r.question.replace(new RegExp(searchTerm, "gi"), match => `<mark>${match}</mark>`);
        container.innerHTML += `
          <div class="card mb-2">
            <div class="card-body">
              <h5 class="card-title">Q: ${highlighted}</h5>
              <a href="question.html?id=${r.id}" class="btn btn-sm btn-outline-primary">View Details</a>
            </div>
          </div>
        `;
      });
    }

    function renderPagination() {
      pagination.innerHTML = "";
      const totalPages = Math.ceil(results.length / resultsPerPage);
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "btn btn-sm btn-primary me-1";
        if (i === currentPage) btn.classList.add("btn-dark");
        btn.onclick = () => {
          currentPage = i;
          renderPage(currentPage);
          renderPagination();
        };
        pagination.appendChild(btn);
      }
    }

    renderPage(currentPage);
    renderPagination();
  });