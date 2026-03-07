import traceback
import sys

try:
    with open('scripts/ingest_job_descriptions.py', 'r', encoding='utf-8') as f:
        code = f.read()
    exec(code)
except Exception as e:
    with open('full_error.txt', 'w', encoding='utf-8') as f:
        traceback.print_exc(file=f)
