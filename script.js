const datePicker = document.getElementById("datePicker");

datePicker.addEventListener("change", function () {
  const selectedDate = this.value;
  if (selectedDate) {
    // নতুন পেজে নিয়ে যাবে, যেখানে সেই তারিখের প্রশ্ন দেখানো হবে
    window.location.href = `results.html?date=${encodeURIComponent(selectedDate)}`;
  }
});

function startSearch() {
  const keyword = document.getElementById("searchBox").value.trim();
  if (keyword) {
    // নতুন পেজে নিয়ে যাবে, যেখানে সার্চ রেজাল্ট দেখানো হবে
    window.location.href = `results.html?search=${encodeURIComponent(keyword)}`;
  }
}