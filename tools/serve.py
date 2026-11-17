#!/usr/bin/env python3
"""
Development Server Multithreaded untuk Legenda Lumina.
Menggantikan 'python3 -m http.server' yang single-threaded agar
ratusan aset JS dan PNG dapat dimuat secara simultan dan instan.
"""
import sys, os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class FastDevHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Izinkan keep-alive dan header yang mempercepat dev loading
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        # Redam log spam ratusan gambar di terminal agar tidak membebani I/O
        if self.path.endswith(('.png', '.js', '.css', '.ico')):
            return
        super().log_message(format, *args)

def run():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, FastDevHandler)
    print(f"Server Legenda Lumina (Multithreaded) berjalan di http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer dihentikan.")

if __name__ == '__main__':
    run()
