import requests
import time
import json
import os
from datetime import datetime, timedelta
from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, LOCAL_USERS

CONFIG_URL = "https://bn.wikipedia.org/w/index.php?title=ব্যবহারকারী:Eftekhar_Naeem/config.json&action=raw"
STATE_FILE = "last_seen.json"

def en_to_bn_number(s):
    return s.translate(str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯"))

def format_bangla_time(utc_time_str):
    utc_time = datetime.strptime(utc_time_str, "%Y-%m-%dT%H:%M:%SZ")
    bd_time = utc_time + timedelta(hours=6)
    hour = bd_time.hour
    minute = bd_time.minute
    meridiem = "ভোর" if hour < 6 else "সকাল" if hour < 12 else "দুপুর" if hour < 18 else "রাত"
    bangla_months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
                     "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"]
    day = en_to_bn_number(str(bd_time.day))
    month = bangla_months[bd_time.month - 1]
    year = en_to_bn_number(str(bd_time.year))
    hour_12 = hour % 12 or 12
    return f"{day} {month} {year}, {meridiem} {en_to_bn_number(str(hour_12))}:{en_to_bn_number(f'{minute:02}')}"

def load_monitor_users():
    users = LOCAL_USERS.copy()
    try:
        r = requests.get(CONFIG_URL, headers={'User-Agent': 'WikiMonitorBot/1.0 (contact: bot@example.com)'})
        r.raise_for_status()
        wiki_users = r.json().get("MONITOR_USERS", [])
        if not isinstance(wiki_users, list):
            wiki_users = []
        users.extend(wiki_users)
    except Exception as e:
        print(f"⚠️ উইকি কনফিগ লোড সমস্যা: {e}")
    return list(set(users))

def load_last_seen():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    # প্রথমবারের জন্য তৈরি
    return {
        "first_run_time": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "users": {}
    }

def save_last_seen(data):
    with open(STATE_FILE, 'w') as f:
        json.dump(data, f)

def send_telegram_message(message):
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    data = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': message,
        'parse_mode': 'HTML'
    }
    try:
        r = requests.post(url, data=data)
        print(f"✅ মেসেজ পাঠানো হয়েছে ({r.status_code})")
    except Exception as e:
        print(f"❌ টেলিগ্রাম ত্রুটি: {e}")

def check_user(user, state):
    url = 'https://bn.wikipedia.org/w/api.php'
    last_seen_rev = state["users"].get(user, "0")
    first_run_time = state["first_run_time"]

    params = {
        'action': 'query',
        'list': 'usercontribs',
        'ucuser': user,
        'uclimit': 50,
        'ucprop': 'title|timestamp|comment|ids',
        'format': 'json',
        'ucdir': 'newer',
        'ucstart': first_run_time  # ✅ মূল চাবিকাঠি
    }
    headers = {'User-Agent': 'WikiMonitorBot/1.0 (contact: bot@example.com)'}

    try:
        r = requests.get(url, params=params, headers=headers)
        data = r.json()
        contribs = data.get('query', {}).get('usercontribs', [])
        if not contribs:
            print(f"[{user}] 🔁 কিছুই পাওয়া যায়নি")
            return

        new_edits = []
        for contrib in contribs:
            revid = str(contrib['revid'])
            if int(revid) > int(last_seen_rev):
                new_edits.append(contrib)

        if not new_edits:
            print(f"[{user}] 🔁 নতুন কিছু নেই")
            return

        new_edits.sort(key=lambda x: x['timestamp'])

        for contrib in new_edits:
            revid = str(contrib['revid'])
            title = contrib['title']
            comment = contrib.get('comment', 'কোনো সারাংশ নেই')
            oldid = contrib.get('parentid', 0)
            diff_url = f"https://bn.wikipedia.org/w/index.php?diff={revid}&oldid={oldid}" if oldid else f"https://bn.wikipedia.org/w/index.php?diff={revid}"
            bangla_time = format_bangla_time(contrib['timestamp'])

            message = (
                f"👤 <b>{user}</b> সম্পাদনা করেছেন:\n"
                f"📄 <b>{title}</b>\n"
                f"🕒 <b>{bangla_time}</b>\n"
                f"💬 সারাংশ: {comment}\n"
                f"🔗 <a href='{diff_url}'>পরিবর্তন দেখুন</a>"
            )

            send_telegram_message(message)
            state["users"][user] = revid

        save_last_seen(state)

    except Exception as e:
        print(f"[{user}] ❌ সমস্যা: {e}")

def main_loop():
    print("🚀 মনিটরিং শুরু...")
    state = load_last_seen()

    while True:
        users = load_monitor_users()
        if not users:
            print("⚠️ কোনো ইউজার পাওয়া যায়নি")
        else:
            for user in users:
                check_user(user, state)
        time.sleep(10)

if __name__ == '__main__':
    main_loop()
