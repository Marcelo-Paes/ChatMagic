from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, send, emit
import eventlet
eventlet.monkey_patch()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode='eventlet')

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('join')
def handle_join(data):
    username = data['username']
    color = data['color']
    msg = f'{username} has entered the chat.'
    emit('notification', msg, broadcast=True)

@socketio.on('message')
def handle_message(data):
    user = data['user']
    message = data['message']
    color = data['color']
    send({'user': user, 'message': message, 'color': color}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
