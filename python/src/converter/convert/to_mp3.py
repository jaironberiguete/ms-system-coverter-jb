import pika, json, tempfile, os
from bson.objectid import ObjectId
from moviepy import VideoFileClip
from gridfs.errors import NoFile

def start(message, fs_videos, fs_mp3s, channel):
    message = json.loads(message)
    print("🔍 Received message:", message)

    try:
        out = fs_videos.get(ObjectId(message["video_fid"]))
    except NoFile:
        print(f"❌ No file found in GridFS with ID {message['video_fid']}")
        return "file not found"

    tf = tempfile.NamedTemporaryFile(delete=False)
    tf.write(out.read())
    tf.close()

    mp3_path = os.path.join(tempfile.gettempdir(), f"{message['video_fid']}.mp3")
    fid = None  # ← PREVENT UnboundLocalError

    try:
        # Extract audio
        audio = VideoFileClip(tf.name).audio
        audio.write_audiofile(mp3_path)
        audio.close()

        # Save MP3 to MongoDB
        with open(mp3_path, "rb") as f:
            fid = fs_mp3s.put(f.read())

        message["mp3_fid"] = str(fid)

        channel.basic_publish(
            exchange="",
            routing_key=os.environ.get("MP3_QUEUE"),
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE
            ),
        )
        print("✅ MP3 published to queue.")

    except Exception as err:
        print("❌ Error during conversion or publishing:", err)
        if fid:
            fs_mp3s.delete(fid)
        return "failed to convert or publish"

    finally:
        os.remove(tf.name)
        if os.path.exists(mp3_path):
            os.remove(mp3_path)

    return "done"