import mimetypes
import string
import os
from flask import Flask, jsonify, request, send_file, make_response
from flask_cors import CORS
import socket
import qrcode
import io

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))
local_ip = s.getsockname()[0]
s.close()

app = Flask(__name__)
CORS(app)


@app.route("/")
def hi():
    f = open("index.html", "r")
    respData = f.read()
    return respData


@app.route("/local_ip")
def localIp():
    return local_ip


@app.route('/qr', methods=['GET'])
def qr_code():
    url = request.args.get('url')
    img = qrcode.make(url)

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    response = make_response(buffer.getvalue())
    response.mimetype = 'image/png'
    return response


@app.route("/drives")
def getDrives():
    available_drives = [
        '%s:' % d for d in string.ascii_uppercase if os.path.exists('%s:' % d)]
    return jsonify(available_drives)


@app.route("/list", methods=["POST"])
def getDirectory():
    print(request.json)
    if "dir" not in request.json:
        return jsonify({"error": True, "error_msg": "Please provide a directory path!"}), 400
    if os.path.isfile(request.json["dir"]):
        return jsonify({"error": True, "error_msg": "This is a file!"}), 400
    curDir = os.listdir(request.json["dir"])
    respData = []
    for directory in curDir:
        if os.path.isfile(os.path.join(request.json["dir"], directory)):
            respData.append({"name": directory, "type": "file", "created": os.path.getctime(
                os.path.join(request.json["dir"], directory)), "modified": os.path.getmtime(
                os.path.join(request.json["dir"], directory))})
        else:
            respData.append({"name": directory, "type": "folder", "created": os.path.getctime(
                os.path.join(request.json["dir"], directory)), "modified": os.path.getmtime(
                os.path.join(request.json["dir"], directory))})
    return jsonify(respData)


@app.route("/getFile")
def getFile():
    fPath = request.args.get("path")
    if fPath is None:
        return jsonify({"error": True, "error_msg": "Please provide a file path!"}), 400
    if os.path.isdir(fPath):
        return jsonify({"error": True, "error_msg": "This is a directory!"}), 400
    mime = mimetypes.guess_type(fPath)
    return send_file(fPath, mimetype=mime[0], conditional=True)


if __name__ == "__main__":
    app.run("127.0.0.1", 9864, debug=True)
