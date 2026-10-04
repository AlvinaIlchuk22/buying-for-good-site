#!/usr/bin/env python3
"""Dev server with caching disabled and HTTP Range support for video.
Run:  python3 serve.py   ->  http://localhost:8782/"""
import http.server, socketserver, os, re

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()
    def send_head(self):
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        if rng and os.path.isfile(path):
            m = re.match(r'bytes=(\d*)-(\d*)', rng)
            if m:
                size = os.path.getsize(path)
                start = int(m.group(1)) if m.group(1) else 0
                end = int(m.group(2)) if m.group(2) else size - 1
                end = min(end, size - 1)
                f = open(path, 'rb'); f.seek(start)
                self.send_response(206)
                self.send_header('Content-Type', self.guess_type(path))
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
                self.send_header('Content-Length', str(end - start + 1))
                self.end_headers()
                self._range = (f, end - start + 1)
                return f
        self._range = None
        return super().send_head()
    def copyfile(self, source, outputfile):
        r = getattr(self, '_range', None)
        if r:
            remaining = r[1]
            while remaining > 0:
                chunk = source.read(min(65536, remaining))
                if not chunk: break
                outputfile.write(chunk); remaining -= len(chunk)
        else:
            super().copyfile(source, outputfile)

socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('', 8782), H) as s:
    print('Serving on http://localhost:8782 (no cache)')
    s.serve_forever()
