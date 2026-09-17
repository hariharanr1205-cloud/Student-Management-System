# API Documentation — Student Management System

Base URL (local dev): `http://127.0.0.1:8000/api/`

All request/response bodies are JSON. All endpoints are namespaced under
`/students/`.

---

## 1. List Students

`GET /api/students/`

Optional query params:
- `search` — matches against first_name, last_name, email, course
- `ordering` — e.g. `last_name`, `-gpa`, `enrollment_date`
- `page` — pagination (20 per page)

**Response 200**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "first_name": "Asha",
      "last_name": "Rao",
      "email": "asha.rao@example.com",
      "phone": "+919876543210",
      "course": "B.Sc Computer Science",
      "enrollment_date": "2024-07-01",
      "gpa": "3.80",
      "created_at": "2026-09-16T10:00:00Z",
      "updated_at": "2026-09-16T10:00:00Z"
    }
  ]
}
```

## 2. Retrieve One Student

`GET /api/students/{id}/`

**Response 200** — single student object (same shape as above).
**Response 404** — `{"detail": "Not found."}`

## 3. Create Student

`POST /api/students/`

**Request body**
```json
{
  "first_name": "Asha",
  "last_name": "Rao",
  "email": "asha.rao@example.com",
  "phone": "+919876543210",
  "course": "B.Sc Computer Science",
  "enrollment_date": "2024-07-01",
  "gpa": 3.8
}
```

**Response 201** — created student object, including `id`.

**Response 400** (validation failure), e.g.:
```json
{ "email": ["student with this email already exists."] }
```
```json
{ "first_name": ["This field may not be blank."] }
```
```json
{ "gpa": ["GPA must be between 0.00 and 4.00."] }
```

## 4. Update Student

`PUT /api/students/{id}/` — full update, all fields required.
`PATCH /api/students/{id}/` — partial update, only changed fields required.

**Response 200** — updated student object.
**Response 400** — validation errors, same shape as Create.
**Response 404** — invalid id.

## 5. Delete Student

`DELETE /api/students/{id}/`

**Response 200**
```json
{ "message": "Student deleted successfully." }
```
**Response 404** — invalid id.

---

## Error Handling Summary

| Scenario                          | Status | Body shape                              |
|-----------------------------------|--------|-------------------------------------------|
| Missing required field            | 400    | `{"<field>": ["This field is required."]}` |
| Invalid email format              | 400    | `{"email": ["Enter a valid email address."]}` |
| Duplicate email                   | 400    | `{"email": ["student with this email already exists."]}` |
| GPA out of range                  | 400    | `{"gpa": ["GPA must be between 0.00 and 4.00."]}` |
| Non-existent id (GET/PUT/DELETE)  | 404    | `{"detail": "Not found."}` |
