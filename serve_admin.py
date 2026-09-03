#!/usr/bin/env python3
"""
Simple web server to serve admin dashboard on port 8001
"""
import http.server
import socketserver
import os
from pathlib import Path

PORT = 8001
ADMIN_DIR = Path(__file__).parent / "admin-dashboard"

class AdminDashboardHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ADMIN_DIR), **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        return super().end_headers()

if __name__ == "__main__":
    os.chdir(ADMIN_DIR)
    with socketserver.TCPServer(("", PORT), AdminDashboardHandler) as httpd:
        print(f"🎯 Admin Dashboard running at http://localhost:{PORT}")
        print(f"📁 Serving from: {ADMIN_DIR}")
        print(f"⛔ Press Ctrl+C to stop")
        httpd.serve_forever()
