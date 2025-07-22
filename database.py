import sqlite3
import os

def init_db(app):
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                filename TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        db.commit()

def get_db():
    db = sqlite3.connect(app.config['DATABASE'])
    db.row_factory = sqlite3.Row
    return db

def save_course(title, description, filename):
    db = get_db()
    db.execute('INSERT INTO courses (title, description, filename) VALUES (?, ?, ?)',
              (title, description, filename))
    db.commit()

def get_courses():
    db = get_db()
    return db.execute('SELECT * FROM courses ORDER BY created_at DESC').fetchall()

# ... autres fonctions CRUD