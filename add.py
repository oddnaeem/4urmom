import json
import os

file_path = "data.json"

if not os.path.exists(file_path):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump({}, f)

# সেশন শুরুতে একবার তারিখ নিবো
date = input("🔹 পুরো সেশনের জন্য তারিখ দিন (যেমন: 2025-07-22): ").strip()

print("আপনার ৮টি প্রশ্ন ইনপুট দিন:\n")

for i in range(1, 9):
    print(f"প্রশ্ন #{i}:")
    question = input("  ❓ প্রশ্ন: ").strip()
    answer = input("  ✅ উত্তর: ").strip()
    explanation = input("  ℹ️ ব্যাখা: ").strip()

    new_entry = {
        "question": question,
        "answer": answer,
        "explanation": explanation
    }

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if date not in data:
        data[date] = []

    data[date].append(new_entry)

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    print(f"✅ প্রশ্ন #{i} সংরক্ষণ হয়েছে।\n")

print("সব প্রশ্ন সংরক্ষণ করা হয়েছে। প্রোগ্রাম শেষ।")