"""Vercel Serverless Function entry point for the Code-Karo.dev API."""
import json
import os
import re
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, unquote, urlparse

try:
    from api.problems_data import PROBLEMS, PATHS, COLLECTIONS
except Exception:
    try:
        from problems_data import PROBLEMS, PATHS, COLLECTIONS
    except Exception:
        PROBLEMS = {}
        PATHS = []
        COLLECTIONS = []

MAX_REQUEST_BYTES = 1_000_000


class handler(BaseHTTPRequestHandler):
    def send_bytes(self, status, body, content_type):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_bytes(status, body, "application/json; charset=utf-8")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def get_effective_path(self):
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)

        # 1. From rewrite query ?path=$1
        if "path" in query and query["path"] and query["path"][0]:
            subpath = query["path"][0].strip("/")
            return f"/api/{subpath}".rstrip("/") if subpath else "/api"

        # 2. From Vercel routing headers
        for h in ("x-matched-path", "x-invoke-path", "x-forwarded-uri"):
            val = self.headers.get(h)
            if val:
                hp = unquote(urlparse(val).path).rstrip("/")
                if hp.startswith("/api"):
                    return hp

        # 3. Direct path
        raw = unquote(parsed.path).rstrip("/")
        if raw.endswith("/index.py"):
            raw = raw[:-len("/index.py")].rstrip("/")
        return raw or "/api"

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json(400, {"error": "Invalid Content-Length header."})
            return None
        if length < 0 or length > MAX_REQUEST_BYTES:
            self.send_json(413, {"error": "Request body must be under 1 MB."})
            return None
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(400, {"error": "Request body must be valid UTF-8 JSON."})
            return None
        if not isinstance(payload, dict):
            self.send_json(400, {"error": "Request body must be a JSON object."})
            return None
        return payload

    def do_GET(self):
        try:
            path = self.get_effective_path()
            if path in ("", "/api"):
                self.send_json(200, {
                    "status": "ok",
                    "app": "Code-Karo.dev API",
                    "problems_count": len(PROBLEMS)
                })
                return

            if path == "/api/problems":
                problem_list = [
                    {
                        "id": p["id"],
                        "display_number": p.get("display_number", 0),
                        "display_id": p.get("display_id", f"{p.get('display_number', 0):02d}"),
                        "title": p.get("title", p["id"]),
                        "summary": p.get("summary", ""),
                        "difficulty": p.get("difficulty", "Easy"),
                        "topics": p.get("topics", []),
                        "languages": p.get("languages", ["Java"]),
                        "path_id": p.get("path_id", "java-basics"),
                        "path_name": p.get("path_name", "Java Basics"),
                        "order_in_path": p.get("order_in_path", 1),
                        "collection_ids": p.get("collection_ids", []),
                        "review_needed": p.get("review_needed", False),
                    }
                    for p in sorted(PROBLEMS.values(), key=lambda x: x.get("display_number", 0))
                ]
                self.send_json(200, {
                    "problems": problem_list,
                    "paths": PATHS,
                    "collections": COLLECTIONS,
                    "status": "ok"
                })
                return

            if path.startswith("/api/problems/"):
                problem_id = path[len("/api/problems/"):]
                problem = PROBLEMS.get(problem_id)
                if problem is None:
                    self.send_json(404, {"error": f"Problem '{problem_id}' not found."})
                    return
                self.send_json(200, problem)
                return
        except Exception as err:
            self.send_json(500, {"error": str(err), "status": "error"})
            return

        # Fallback static file serving if a static request reaches the serverless function
        clean = path.strip("/")
        if clean.startswith("web/"):
            clean = clean[4:]
        if clean.startswith("public/"):
            clean = clean[7:]
        if clean in ("problems", "problems.html"):
            self.send_response(302)
            self.send_header("Location", "/practice")
            self.end_headers()
            return

        if clean in ("", "index.html", "practice", "practice.html", "dashboard", "dashboard.html", "profile", "profile.html", "app.css", "app.js", "config.js"):
            file_name = clean or "index.html"
            if file_name == "practice":
                file_name = "practice.html"
            elif file_name == "dashboard":
                file_name = "dashboard.html"
            elif file_name == "profile":
                file_name = "profile.html"
            content_types = {
                "index.html": "text/html; charset=utf-8",
                "practice.html": "text/html; charset=utf-8",
                "dashboard.html": "text/html; charset=utf-8",
                "profile.html": "text/html; charset=utf-8",
                "app.css": "text/css; charset=utf-8",
                "app.js": "application/javascript; charset=utf-8",
                "config.js": "application/javascript; charset=utf-8",
            }
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            for folder in ("public", "web"):
                file_path = os.path.join(base_dir, folder, file_name)
                if os.path.isfile(file_path):
                    try:
                        with open(file_path, "rb") as f:
                            self.send_bytes(200, f.read(), content_types.get(file_name, "text/plain"))
                        return
                    except Exception:
                        pass

        self.send_json(404, {
            "error": "Endpoint not found.",
            "resolved_path": path,
            "raw_path": self.path
        })

    def do_POST(self):
        path = self.get_effective_path()
        match = re.fullmatch(r"/api/problems/([a-z0-9-]+)/(save|run)", path)
        if match is None:
            self.send_json(404, {
                "error": "Endpoint not found.",
                "resolved_path": path,
                "raw_path": self.path
            })
            return

        problem_id, action = match.groups()
        if problem_id not in PROBLEMS:
            self.send_json(404, {"error": f"Problem '{problem_id}' not found."})
            return

        payload = self.read_json()
        if payload is None:
            return
        source = payload.get("code")
        if not isinstance(source, str):
            self.send_json(400, {"error": "The 'code' field must be a string."})
            return

        if action == "save":
            self.send_json(200, {
                "saved": True,
                "note": "Saved (saved in browser local storage and preview session)."
            })
            return

        self.send_json(400, {
            "error": "Code execution is hosted on the runner backend. Please configure RUNNER_URL."
        })
