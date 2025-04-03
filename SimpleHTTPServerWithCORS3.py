#!/usr/bin/env python3
import http.server
import socketserver

IP = "0.0.0.0"
PORT = 8000

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
  def end_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    # For SharedArrayBuffer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
    self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
    self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
    http.server.SimpleHTTPRequestHandler.end_headers(self)

Handler = CORSRequestHandler

with socketserver.TCPServer((IP, PORT), Handler) as httpd:
  print(f'Serving HTTP with CORS on {IP} port {PORT} (http://{IP}:{PORT}/) ...')
  httpd.serve_forever()
