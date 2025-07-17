const params = new URLSearchParams(window.location.search);
const searchQuery = params.get("search");
const dateQuery = params.get("date");
const resultsDiv = document.getElementById("results");

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    let output = "";

    if (dateQuery && data[dateQuery]) {
      data[dateQuery].forEach((entry) => {
        output += formatEntry(entry, dateQuery);
      });
    } else if (searchQuery) {
      const keyword = searchQuery.toLowerCase();

      for (const date in data) {
        data[date].forEach((entry) => {
          const q = entry.question?.toLowerCase() || "";
          const a = entry.answer?.toLowerCase() || "";
          const e = entry.explanation?.toLowerCase() || "";

          if (q.includes(keyword) || a.includes(keyword) || e.includes(keyword)) {
            output += formatEntry(entry, date);
          }
        });
      }
    }

    resultsDiv.innerHTML = output || "<p>❌ কিছুই পাওয়া যায়নি</p>";
  });

function formatEntry(entry, date) {
  return `
    <div class="result">
      <strong>📅 তারিখ:</strong> ${date}<br>
      <strong>❓ প্রশ্ন:</strong> ${entry.question}<br>
      <strong>✅ উত্তর:</strong> ${entry.answer}<br>
      <strong>📝 ব্যাখ্যা:</strong> ${entry.explanation}
    </div><br>
  `;
}
