# Student Management System (CRUD Web App)

A full-stack CRUD application built to the project SOP: Django REST
Framework backend + SQLite database, plain HTML/CSS/JavaScript frontend,
REST API, validation on both client and server, and Postman-based API
tests.

## Architecture

```
User → HTML/CSS/JavaScript Frontend → fetch() → REST API
     → Django REST Framework Backend → ORM → SQLite Database
```

## Project Structure

```
student-management-system/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── studentms/            # Django project (settings, urls, wsgi/asgi)
│   └── students/             # Django app (model, serializer, views, urls, admin)
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── API_DOCUMENTATION.md
├── PROJECT_REPORT.md
├── postman_collection.json
└── README.md
```

## Entity: Student

| Field            | Type            | Rules                                          |
|------------------|-----------------|-------------------------------------------------|
| id               | auto            | primary key                                      |
| first_name       | text            | required                                         |
| last_name        | text            | required                                         |
| email            | email           | required, unique, valid format                   |
| phone            | text            | required, 7–15 digits, optional leading `+`      |
| course           | text            | required                                         |
| enrollment_date  | date            | required                                         |
| gpa              | decimal(3,2)    | required, 0.00–4.00                              |
| created_at       | datetime        | auto                                             |
| updated_at       | datetime        | auto                                             |

## Setup & Run — Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

# optional: create an admin login for /admin/
python manage.py createsuperuser

python manage.py runserver
```

The API is now live at `http://127.0.0.1:8000/api/students/`.

## Setup & Run — Frontend

The frontend is plain HTML/CSS/JS — no build step. Two options:

**Option A — quick open:** open `frontend/index.html` directly in a browser.
**Option B — recommended (avoids browser file:// quirks):**

```bash
cd frontend
python -m http.server 5500
```

Then visit `http://127.0.0.1:5500`. Make sure the Django backend is
running at the same time — the frontend calls it directly via `fetch()`.

> CORS is already configured in `backend/studentms/settings.py` to allow
> `localhost:5500` and `localhost:3000`. Add any other origin you serve
> the frontend from to `CORS_ALLOWED_ORIGINS`.

## REST API Endpoints

| Operation  | Method     | Endpoint                  |
|------------|------------|----------------------------|
| Create     | POST       | `/api/students/`           |
| Read all   | GET        | `/api/students/`           |
| Read one   | GET        | `/api/students/{id}/`      |
| Update     | PUT/PATCH  | `/api/students/{id}/`      |
| Delete     | DELETE     | `/api/students/{id}/`      |

List supports `?search=<text>` (matches first/last name, email, course)
and `?ordering=<field>` (e.g. `-gpa` for descending). Full details in
`API_DOCUMENTATION.md`.

## Testing

- Import `postman_collection.json` into Postman for ready-made requests
  covering valid create, missing-field create, duplicate-email create,
  read, update, delete, and not-found cases (SOP section 10).
- Run `python manage.py test` in `backend/` (add test cases in
  `students/tests.py` as you extend the project) for automated checks.

## Notes on the SOP Checklist

- Frontend/backend/DB separation: three independent layers, connected
  only via HTTP + JSON.
- Validation: enforced in `students/serializers.py` (server) and
  `frontend/app.js` (client) — the server is authoritative.
- Secrets: `SECRET_KEY` reads from an environment variable, with a
  dev-only fallback — set `DJANGO_SECRET_KEY` before any real deployment.
- Version control: this folder is a normal Git-ready project — run
  `git init`, commit, and push it to your repository as the SOP requires.
