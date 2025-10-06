from app import db, Task

# Make sure tables exist
db.create_all()

# Sample tasks
sample_tasks = [
    Task(content="Buy groceries", completed=False, order=0),
    Task(content="Finish Flask project", completed=False, order=1),
    Task(content="Read a book", completed=True, order=2),
    Task(content="Exercise for 30 minutes", completed=False, order=3)
]

# Insert tasks into database
db.session.add_all(sample_tasks)
db.session.commit()

print("✅ Pre-filled database created successfully!")
