import pika, sys, os, time
from pymongo import MongoClient
import gridfs
from convert import to_mp3

def main():
    mongo_host = os.environ.get("MONGO_HOST")
    mongo_user = os.environ.get("MONGO_USER")
    mongo_pass = os.environ.get("MONGO_PASS")

    client = MongoClient(
        f"mongodb://{mongo_user}:{mongo_pass}@{mongo_host}:27017/"
    )
    db_videos = client.videos
    db_mp3s = client.mp3s
    #gridfs
    fs_videos = gridfs.GridFS(db_videos)
    fs_mp3s = gridfs.GridFS(db_mp3s)

    #rabbitmq connection
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host="rabbitmq")
    )

    def callback(ch, method, properties, body):
        try:
            err = to_mp3.start(body, fs_videos, fs_mp3s, ch)
            print("✔️ Callback result:", err)
        except Exception as e:
            print(f"❌ Unexpected error in callback: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        ch.basic_ack(delivery_tag=method.delivery_tag)


    channel = connection.channel()
    channel.basic_consume(
        queue=os.environ.get("VIDEO_QUEUE"), on_message_callback= callback
    )

    print("Waiting for a messages. To exit press CTRL+C")

    channel.start_consuming()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt: 
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)