import os
from pathlib import Path

# Ensure pydantic loads apps/api/.env when pytest runs from repo root or IDE.
_API_ROOT = Path(__file__).resolve().parents[1]
os.chdir(_API_ROOT)