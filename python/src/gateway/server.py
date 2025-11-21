import os, gridfs, pika, json
from flask import Flask, request, send_file
from flask_pymongo import PyMongo
from auth import validate 
from auth_svc import access
from storage import util
from bson.objectid import ObjectId
from flask_cors import CORS
import logging

server = Flask(__name__)
#Allow frontend origin request with CORS
CORS(server, supports_credentials=True)

#For logging app behavior
logging.basicConfig(level=logging.DEBUG)
server.logger.setLevel(logging.DEBUG)

mongo_host = os.environ.get("MONGO_HOST")
mongo_user = os.environ.get("MONGO_USER")
mongo_pass = os.environ.get("MONGO_PASS")

mongo_video = PyMongo(
    server,
    uri=  f"mongodb://{mongo_user}:{mongo_pass}@{mongo_host}:27017/videos?authSource=admin"
    )

mongo_mp3 = PyMongo(
    server,
    uri=  f"mongodb://{mongo_user}:{mongo_pass}@{mongo_host}:27017/mp3s?authSource=admin"
    )

fs_videos = gridfs.GridFS(mongo_video.db)
fs_mp3s = gridfs.GridFS(mongo_mp3.db)

connection = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
channel = connection.channel()

@server.route("/login", methods=["POST"])
def login():
    token, err = access.login(request)
    server.logger.info(request.headers)

    if not err:
        return token
    else:
        return err

@server.route("/upload", methods=["POST"])
def upload():
    access, err = validate.token(request)

    if err:
        return err

    access = json.loads(access)

    if access["admin"]:
        if len(request.files) > 1 or len(request.files) <1:
           return "exacly 1 file required", 400
        for _, f in request.files.items():
            err = util.upload(f, fs_videos, channel, access)
            if err:
                return err
        return "success", 200
    else:
        return "not authorized", 401

@server.route("/download", methods=["GET"])
def download():
    access, err = validate.token(request)

    if err:
        return err

    access = json.loads(access)
    
    if access["admin"]:
        fid_string = request.args.get("fid")
        if not fid_string:
            return "fid id required", 401
        
        try:
            out = fs_mp3s.get(ObjectId(fid_string))
            return send_file(out, download_name=f'{fid_string}.mp3')
        except Exception as err:
            print(err)
            return "internal server error", 500
        
    return "No authorized", 400        


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=8080)