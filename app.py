import os
from flask import Flask, Markup, render_template, request, redirect, url_for, send_from_directory, session, flash
from werkzeug.utils import secure_filename
import psycopg2
from psycopg2.extras import DictCursor
from functools import wraps
import markdown
import markdown.extensions.fenced_code

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY') or 'dev-secret-key-123'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}

# Configuration PostgreSQL
app.config['DATABASE'] = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'database': os.environ.get('DB_NAME', 'pdf_courses'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', 'postgres'),
    'port': os.environ.get('DB_PORT', 5432)
}

def get_db_connection():
    conn = psycopg2.connect(
        host=app.config['DATABASE']['host'],
        database=app.config['DATABASE']['database'],
        user=app.config['DATABASE']['user'],
        password=app.config['DATABASE']['password'],
        port=app.config['DATABASE']['port']
    )
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Vérifier si la table existe déjà
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'courses'
        );
    """)
    table_exists = cur.fetchone()[0]
    
    if not table_exists:
        # Créer les tables si elles n'existent pas
        cur.execute('''
            CREATE TABLE courses (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                filename VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cur.execute('''
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        print("Tables créées avec succès")
        
        # Créer un utilisateur admin par défaut
        try:
            cur.execute(
                "INSERT INTO users (username, password, is_admin) VALUES (%s, %s, %s)",
                ('admin', 'admin123', True)
            )
            conn.commit()
            print("Utilisateur admin créé avec succès")
        except Exception as e:
            conn.rollback()
            print(f"Erreur lors de la création de l'admin: {e}")
    
    cur.close()
    conn.close()

def init_app():
    # Créer le dossier d'upload s'il n'existe pas
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialiser la base de données
    init_db()
    
    # Vérifier si l'admin existe déjà
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
    admin_exists = cur.fetchone()[0] > 0
    cur.close()
    conn.close()
    
    # Créer l'admin si nécessaire
    if not admin_exists:
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                "INSERT INTO users (username, password, is_admin) VALUES (%s, %s, %s)",
                ('admin', 'admin123', True)  # En production, utiliser bcrypt
            )
            conn.commit()
            print("Utilisateur admin créé avec succès")
        except Exception as e:
            conn.rollback()
            print(f"Erreur lors de la création de l'admin: {e}")
        finally:
            cur.close()
            conn.close()

# Décorateurs d'authentification
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            flash('Veuillez vous connecter', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session or not session['user'].get('is_admin'):
            flash('Accès non autorisé', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# Fonctions DB
def save_course(title, description, filename):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO courses (title, description, filename) VALUES (%s, %s, %s) RETURNING id',
        (title, description, filename)
    )
    course_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return course_id

def get_courses():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=DictCursor)
    cur.execute('SELECT * FROM courses ORDER BY created_at DESC')
    courses = cur.fetchall()
    cur.close()
    conn.close()
    return courses

def get_course(course_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=DictCursor)
    cur.execute('SELECT * FROM courses WHERE id = %s', (course_id,))
    course = cur.fetchone()
    cur.close()
    conn.close()
    return course

def delete_course(course_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM courses WHERE id = %s', (course_id,))
    conn.commit()
    cur.close()
    conn.close()

def update_course(course_id, title, description):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'UPDATE courses SET title = %s, description = %s WHERE id = %s',
        (title, description, course_id)
    )
    conn.commit()
    cur.close()
    conn.close()

def get_user_by_username(username):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=DictCursor)
    cur.execute('SELECT * FROM users WHERE username = %s', (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

@app.template_filter('markdown')
def markdown_filter(text):
    if not text:
        return ""
    return Markup(markdown.markdown(text, extensions=['fenced_code', 'tables']))

# Routes publiques
@app.route('/')
def index():
    courses = get_courses()
    return render_template('index.html', courses=courses)

@app.route('/view/<int:course_id>')
def view(course_id):
    course = get_course(course_id)
    if not course:
        flash('Cours non trouvé', 'error')
        return redirect(url_for('index'))
    return render_template('view.html', course=course)

@app.route('/pdf/<filename>')
def pdf(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Authentification
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = get_user_by_username(username)
        
        if user and user['password'] == password:  # En production, utiliser bcrypt
            session['user'] = {
                'id': user['id'],
                'username': user['username'],
                'is_admin': user['is_admin']
            }
            flash('Connexion réussie', 'success')
            return redirect(url_for('admin_dashboard' if user['is_admin'] else 'index'))
        flash('Identifiants incorrects', 'error')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Vous avez été déconnecté', 'success')
    return redirect(url_for('index'))

# Zone admin
@app.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    courses = get_courses()
    return render_template('admin/dashboard.html', courses=courses)

@app.route('/admin/upload', methods=['GET', 'POST'])
@login_required
@admin_required
def upload():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        file = request.files['file']
        
        if not (title and file):
            flash('Titre et fichier sont obligatoires', 'error')
            return redirect(url_for('upload'))
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            save_course(title, description, filename)
            flash('Cours ajouté avec succès', 'success')
            return redirect(url_for('admin_dashboard'))
    
    return render_template('upload.html')

@app.route('/admin/edit/<int:course_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit(course_id):
    course = get_course(course_id)
    if not course:
        flash('Cours non trouvé', 'error')
        return redirect(url_for('admin_dashboard'))
    
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        update_course(course_id, title, description)
        flash('Cours mis à jour avec succès', 'success')
        return redirect(url_for('admin_dashboard'))
    
    return render_template('edit.html', course=course)

@app.route('/admin/delete/<int:course_id>', methods=['POST'])
@login_required
@admin_required
def delete(course_id):
    course = get_course(course_id)
    if course:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], course['filename'])
        if os.path.exists(filepath):
            os.remove(filepath)
        delete_course(course_id)
        flash('Cours supprimé avec succès', 'success')
    return redirect(url_for('admin_dashboard'))

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

if __name__ == '__main__':
    init_app()
    app.run(host='0.0.0.0', port=5000, debug=True)