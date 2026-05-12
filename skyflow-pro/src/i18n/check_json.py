
import json
import sys

def check_json(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
        print(f"{filepath} is valid JSON")
    except Exception as e:
        print(f"{filepath} is INVALID JSON: {e}")

check_json('f:/SkyFlow-Pro/skyflow-pro/src/i18n/locales/en.json')
check_json('f:/SkyFlow-Pro/skyflow-pro/src/i18n/locales/es.json')
check_json('f:/SkyFlow-Pro/skyflow-pro/src/i18n/locales/fr.json')
check_json('f:/SkyFlow-Pro/skyflow-pro/src/i18n/locales/hi.json')
check_json('f:/SkyFlow-Pro/skyflow-pro/src/i18n/locales/ar.json')
