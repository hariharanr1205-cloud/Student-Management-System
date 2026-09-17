# Project Report: Student Management System

## 1. Title & Overview
A full-stack CRUD web application for managing student records —
create, view, search, update, and delete students through a REST API.

## 2. Problem Statement
Academic institutions need a simple, reliable way to record and
maintain student information (contact details, enrolled course, GPA)
without relying on spreadsheets prone to duplication and manual error.

## 3. Objectives
- Provide a web interface for full CRUD on student records.
- Enforce validation consistently on both client and server.
- Expose a documented REST API that other tools (e.g. Postman) can
  exercise directly.
- Demonstrate a clean three-layer architecture: frontend, API, database.

## 4. Technology Stack
| Layer            | Technology                          |
|-------------------|--------------------------------------|
| Frontend          | HTML, CSS, JavaScript (vanilla, `fetch`) |
| Backend           | Django 5 + Django REST Framework     |
| Database          | SQLite (swappable for MySQL/PostgreSQL) |
| API Testing       | Postman collection (included)        |
| Version Control   | Git / GitHub                         |

## 5. System Architecture
```
Browser (HTML/CSS/JS)
   │  fetch() → JSON over HTTP
   ▼
Django REST Framework API  (/api/students/)
   │  Django ORM
   ▼
SQLite Database (db.sqlite3)
```

The frontend and backend are fully decoupled and communicate only
through the documented REST endpoints, so either layer can be replaced
independently (e.g. swapping the vanilla-JS frontend for React later).

## 6. Database / Entity Design
Single entity, `Student`, in `backend/students/models.py`:

| Field | Type | Constraints |
|---|---|---|
| id | AutoField | primary key |
| first_name | CharField(50) | required |
| last_name | CharField(50) | required |
| email | EmailField | required, **unique**, valid format |
| phone | CharField(16) | required, regex `^\+?\d{7,15}$` |
| course | CharField(100) | required |
| enrollment_date | DateField | required |
| gpa | DecimalField(3,2) | required, 0.00–4.00 |
| created_at / updated_at | DateTimeField | auto-managed |

## 7. API Endpoints
See `API_DOCUMENTATION.md` for the full reference (request/response
examples, error shapes). Summary:

| Operation | Method | Endpoint |
|---|---|---|
| Create | POST | /api/students/ |
| Read all | GET | /api/students/ |
| Read one | GET | /api/students/{id}/ |
| Update | PUT/PATCH | /api/students/{id}/ |
| Delete | DELETE | /api/students/{id}/ |

## 8. CRUD Implementation Details
- **Create** — `StudentViewSet.create` validates via
  `StudentSerializer`, returns `201` with the created record or `400`
  with field-level errors.
- **Read** — `list`/`retrieve` support `?search=` (name/email/course)
  and `?ordering=` (e.g. `-gpa`), paginated 20 per page.
- **Update** — `PUT` (full) and `PATCH` (partial) both re-run
  validation before saving.
- **Delete** — removes the row and returns a confirmation message;
  the frontend asks for confirmation before calling it.

## 9. Validation
- **Server-side (authoritative):** `students/serializers.py` — required
  fields, email format (Django's `EmailField`), unique email, phone
  regex, GPA range 0–4.
- **Client-side (UX layer):** `frontend/app.js` `validateClientSide()`
  mirrors the same rules so users get instant feedback before a
  network round trip; the server re-checks everything regardless.

## 10. Testing
- `postman_collection.json` covers: valid create, missing-field
  create, duplicate-email create, invalid-GPA create, read all, read
  valid/invalid id, update valid/invalid id, delete valid/invalid id.
- Suggested manual UI tests: add a student, confirm it appears in the
  table; edit a student, confirm values persist after refresh; delete
  a student, confirm removal; search/sort controls filter correctly;
  resize the browser to confirm the layout stays usable on mobile
  widths.
- To automate: add cases to `backend/students/tests.py` using Django's
  `APITestCase` and run `python manage.py test`.

## 11. Installation & Execution
See `README.md` for full setup steps (backend venv + migrations +
`runserver`; frontend via a static file server on port 5500).

## 12. Challenges & Solutions
- **Cross-origin requests** between the frontend (static file server)
  and backend (Django dev server) were blocked by default — resolved
  with `django-cors-headers` and an explicit allow-list of local dev
  origins.
- **Consistent validation** between client and server risked drifting
  out of sync — the client-side rules were written to mirror the
  serializer's rules exactly (same regex, same GPA bounds) so error
  messages stay consistent.

## 13. Future Enhancements
- Add authentication (e.g. token or session-based) so only authorized
  staff can modify records.
- Add pagination controls and column sorting indicators in the UI.
- Add bulk import/export (CSV).
- Add automated test coverage in CI via GitHub Actions.

## 14. Repository
Initialize with `git init`, commit this project, and push to your
group's GitHub repository as the final submission step.
