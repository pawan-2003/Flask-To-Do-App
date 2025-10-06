from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ---------- DATABASE MODEL ----------
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, default=0)

# ---------- ROUTES ----------
@app.route('/')
def home():
    tasks = Task.query.order_by(Task.order).all()
    return render_template('index.html', tasks=tasks)

@app.route('/add', methods=['POST'])
def add_task():
    data = request.get_json()
    new_task = Task(content=data['content'], completed=False, order=Task.query.count())
    db.session.add(new_task)
    db.session.commit()
    return jsonify({'id': new_task.id, 'content': new_task.content, 'completed': new_task.completed})

@app.route('/delete/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'error': 'Task not found'}), 404

@app.route('/complete/<int:task_id>', methods=['PUT'])
def complete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        task.completed = not task.completed
        db.session.commit()
        return jsonify({'completed': task.completed})
    return jsonify({'error': 'Task not found'}), 404

@app.route('/clear_completed', methods=['DELETE'])
def clear_completed():
    completed_tasks = Task.query.filter_by(completed=True).all()
    for task in completed_tasks:
        db.session.delete(task)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/reorder', methods=['PUT'])
def reorder_tasks():
    data = request.get_json()
    for idx, task_id in enumerate(data['order']):
        task = Task.query.get(int(task_id))
        if task:
            task.order = idx
    db.session.commit()
    return jsonify({'success': True})

# ---------- MAIN ----------
if __name__ == '__main__':
    # Create database inside app context
    with app.app_context():
        db.create_all()
    # Run Flask app
    app.run(debug=True)


