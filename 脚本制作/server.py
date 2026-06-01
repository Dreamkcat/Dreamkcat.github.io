#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""本地服务：提供静态页面，并将项目保存到「脚本」文件夹。"""

import json
import os
import re
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.join(ROOT, '脚本')


def sanitize_filename(name):
    cleaned = (name or '').strip()
    cleaned = re.sub(r'[\\/:*?"<>|]', '_', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'\.+$', '', cleaned)[:80]
    return cleaned or '未命名分镜'


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/status':
            self._json_response({
                'ok': True,
                'scriptsDir': SCRIPTS_DIR,
                'scriptsDirExists': os.path.isdir(SCRIPTS_DIR),
            })
            return
        if self.path == '/api/list':
            files = []
            if os.path.isdir(SCRIPTS_DIR):
                for name in sorted(os.listdir(SCRIPTS_DIR)):
                    if name.lower().endswith('.json'):
                        path = os.path.join(SCRIPTS_DIR, name)
                        files.append({
                            'name': name,
                            'modified': os.path.getmtime(path),
                        })
            self._json_response({'ok': True, 'files': files})
            return
        if self.path.startswith('/api/load/'):
            filename = unquote(self.path[len('/api/load/'):])
            if '..' in filename or filename.startswith('/'):
                self.send_error(400)
                return
            path = os.path.join(SCRIPTS_DIR, filename)
            if not os.path.isfile(path):
                self.send_error(404)
                return
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self._json_response({'ok': True, 'data': data, 'filename': filename})
            return
        super().do_GET()

    def do_POST(self):
        if self.path != '/api/save':
            self.send_error(404)
            return
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length).decode('utf-8'))
        project = body.get('project')
        if not project:
            self._json_response({'ok': False, 'error': '缺少项目数据'}, status=400)
            return
        if not os.path.isdir(SCRIPTS_DIR):
            self._json_response({'ok': False, 'error': '脚本文件夹不存在'}, status=500)
            return
        filename = sanitize_filename(body.get('filename') or project.get('title')) + '.json'
        path = os.path.join(SCRIPTS_DIR, filename)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(project, f, ensure_ascii=False, indent=2)
        self._json_response({'ok': True, 'filename': filename, 'path': path})

    def log_message(self, format, *args):
        if args and '/api/' not in str(args[0]):
            super().log_message(format, *args)

    def _json_response(self, payload, status=200):
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main():
    if not os.path.isdir(SCRIPTS_DIR):
        print('未找到「脚本」文件夹，保存功能将不可用。')
        print('路径：', SCRIPTS_DIR)
    else:
        os.makedirs(SCRIPTS_DIR, exist_ok=True)
        print('项目将保存到：', SCRIPTS_DIR)

    port = 8765
    url = f'http://127.0.0.1:{port}/'
    server = HTTPServer(('127.0.0.1', port), Handler)
    print(f'服务已启动：{url}')
    print('按 Ctrl+C 停止服务')

    import webbrowser
    webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n服务已停止')
        server.server_close()


if __name__ == '__main__':
    main()
