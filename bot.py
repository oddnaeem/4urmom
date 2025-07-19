import requests
import time
import json
import os
from datetime import datetime, timedelta
from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, LOCAL_USERS, USE_WIKI_CONFIG, USE_ADMIN_GROUP, USE_BUREAUCRAT_GROUP

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

def fetch_users_by_group(group):
    url = "https://bn.wikipedia.org/w/api.php"
    users = []
    params = {
        'action': 'query',
        'list': 'allusers',
        'augroup': group,
        'aulimit': '500',
        'format': 'json'
    }
    headers = {'User-Agent': 'WikiMonitorBot/1.0 (contact: bot@example.com)'}

    while True:
        try:
            r = requests.get(url, params=params, headers=headers)
            r.raise_for_status()
            data = r.json()
            allusers = data.get("query", {}).get("allusers", [])
            users.extend([u["name"] for u in allusers])

            if "continue" in data:
                params.update(data["continue"])
            else:
                break
        except Exception as e:
            print(f"⚠️ গ্রুপ {group} থেকে ইউজার আনতে সমস্যা: {e}")
            break

    return users

def load_monitor_users():
    users = LOCAL_USERS.copy() if isinstance(LOCAL_USERS, list) else []

    if USE_WIKI_CONFIG:
        try:
            r = requests.get(CONFIG_URL, headers={'User-Agent': 'WikiMonitorBot/1.0 (contact: bot@example.com)'})
            r.raise_for_status()
            wiki_users = r.json().get("MONITOR_USERS", [])
            if isinstance(wiki_users, list):
                users.extend(wiki_users)
        except Exception as e:
            print(f"⚠️ উইকি কনফিগ লোড সমস্যা: {e}")

    if USE_ADMIN_GROUP:
        users.extend(fetch_users_by_group("sysop"))
    if USE_BUREAUCRAT_GROUP:
        users.extend(fetch_users_by_group("bureaucrat"))

    return list(set(users))

def load_last_seen():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            return json.load(f)

    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    return {
        "first_run_time": now,
        "last_rc_timestamp": now,
        "users": {}
    }

def save_last_seen(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f)

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

def check_recent_changes(users, state):
    url = "https://bn.wikipedia.org/w/api.php"
    last_ts = state.get("last_rc_timestamp", state["first_run_time"])

    params = {
        'action': 'query',
        'list': 'recentchanges',
        'rcstart': last_ts,
        'rcdir': 'newer',
        'rclimit': '500',
        'rcprop': 'title|ids|user|timestamp|comment|type',
        'format': 'json'
    }

    headers = {'User-Agent': 'WikiMonitorBot/1.0 (contact: bot@example.com)'}

    latest_seen = last_ts
    sent_count = 0

    while True:
        try:
            r = requests.get(url, params=params, headers=headers)
            r.raise_for_status()
            data = r.json()
            changes = data.get('query', {}).get('recentchanges', [])

            for change in changes:
                user = change.get('user')
                if user not in users:
                    continue

                revid = str(change.get('revid', '0'))
                prev_revid = str(change.get('old_revid', '0'))
                timestamp = change.get('timestamp')
                title = change.get('title')
                change_type = change.get('type', 'edit')

                last_seen_user_rev = state['users'].get(user, '0')
                if int(revid) <= int(last_seen_user_rev):
                    continue

                if change_type == 'new':
                    summary = 'তৈরি'
                elif change_type == 'edit':
                    summary = 'সম্পাদনা'
                elif change_type == 'log':
                    summary = 'লগ এন্ট্রি'
                elif change_type == 'categorize':
                    summary = 'বিষয়বস্তু পরিবর্তন'
                else:
                    summary = 'অন্যান্য'

                bangla_time = format_bangla_time(timestamp)
                page_url = f"https://bn.wikipedia.org/wiki/{title.replace(' ', '_')}"

                message = (
                    f"👤 <b>{user}</b> সম্পাদনা করেছেন:\n"
                    f"📄 <b>{title}</b>\n"
                    f"🕒 <b>{bangla_time}</b>\n"
                    f"💬 সারাংশ: {summary}\n"
                    f"🔗 <a href='{page_url}'>পাতা দেখুন</a>"
                )

                send_telegram_message(message)
                state["users"][user] = revid
                sent_count += 1

                if timestamp > latest_seen:
                    latest_seen = timestamp

            if "continue" in data:
                params.update(data["continue"])
            else:
                break

        except Exception as e:
            print(f"❌ recentchanges ত্রুটি: {e}")
            break

    if sent_count:
        print(f"📦 পাঠানো হয়েছে {sent_count} টি মেসেজ")

    state["last_rc_timestamp"] = latest_seen
    save_last_seen(state)

def main_loop():
    print("🚀 মনিটরিং শুরু...")
    state = load_last_seen()

    while True:
        users = load_monitor_users()
        if not users:
            print("⚠️ কোনো ইউজার পাওয়া যায়নি")
        else:
            check_recent_changes(users, state)
        time.sleep(10)

if __name__ == '__main__':
    main_loop()
