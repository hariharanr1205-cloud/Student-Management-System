// ---------------------------------------------------------------------
// Student Management System — frontend logic
// Talks to the Django REST Framework API at API_BASE.
// Implements: list/search/sort (Read), create (Create), edit (Update),
// delete (Delete), client-side validation mirroring server rules,
// and user-facing success/error messages (SOP section 7.7 / 9).
// ---------------------------------------------------------------------

const API_BASE = 'http://127.0.0.1:8000/api/students/';

const form = document.getElementById('student-form');
const idField = document.getElementById('student-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-edit-btn');
const formTitle = document.getElementById('form-title');
const tableWrapper = document.getElementById('table-wrapper');
const statusBanner = document.getElementById('status-banner');
const searchInput = document.getElementById('search-input');
const orderingSelect = document.getElementById('ordering-select');
const refreshBtn = document.getElementById('refresh-btn');

const fields = ['first_name', 'last_name', 'email', 'phone', 'course', 'enrollment_date', 'gpa'];

let debounceTimer = null;

function showStatus(message, type) {
  statusBanner.textContent = message;
  statusBanner.className = type === 'error' ? 'status-error' : 'status-success';
  statusBanner.style.display = 'block';
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => { statusBanner.style.display = 'none'; }, 4000);
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function showFieldErrors(errors) {
  clearFieldErrors();
  Object.entries(errors).forEach(([field, msgs]) => {
    const el = document.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = Array.isArray(msgs) ? msgs[0] : String(msgs);
  });
}

// ---- Client-side validation (mirrors server-side rules; SOP section 9) ----
function validateClientSide() {
  const errors = {};
  const get = id => document.getElementById(id).value.trim();

  if (!get('first_name')) errors.first_name = 'First name is required.';
  if (!get('last_name')) errors.last_name = 'Last name is required.';

  const email = get('email');
  if (!email) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';

  const phone = get('phone');
  if (!phone) errors.phone = 'Phone is required.';
  else if (!/^\+?\d{7,15}$/.test(phone)) errors.phone = '7–15 digits, optional leading +.';

  if (!get('course')) errors.course = 'Course is required.';
  if (!get('enrollment_date')) errors.enrollment_date = 'Enrollment date is required.';

  const gpa = parseFloat(get('gpa'));
  if (Number.isNaN(gpa)) errors.gpa = 'GPA is required.';
  else if (gpa < 0 || gpa > 4) errors.gpa = 'GPA must be between 0.00 and 4.00.';

  return errors;
}

function resetForm() {
  form.reset();
  idField.value = '';
  formTitle.textContent = 'Add Student';
  submitBtn.textContent = 'Add Student';
  cancelBtn.style.display = 'none';
  clearFieldErrors();
}

function populateForm(student) {
  idField.value = student.id;
  fields.forEach(f => { document.getElementById(f).value = student[f]; });
  formTitle.textContent = `Edit Student #${student.id}`;
  submitBtn.textContent = 'Save Changes';
  cancelBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- API calls (Create / Read / Update / Delete) ----
async function apiList() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (orderingSelect.value) params.set('ordering', orderingSelect.value);
  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load students.');
  const data = await res.json();
  return data.results ?? data; // supports paginated or plain list responses
}

async function apiCreate(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw { fieldErrors: data };
  return data;
}

async function apiUpdate(id, payload) {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw { fieldErrors: data };
  return data;
}

async function apiDelete(id) {
  const res = await fetch(`${API_BASE}${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete student.');
  return res.json();
}

// ---- Rendering ----
function renderTable(students) {
  if (!students.length) {
    tableWrapper.innerHTML = '<div class="empty-state">No students yet. Add your first record above.</div>';
    return;
  }

  const rows = students.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.phone)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td>${s.enrollment_date}</td>
      <td>${Number(s.gpa).toFixed(2)}</td>
      <td class="row-actions">
        <button class="btn-secondary" data-edit="${s.id}">Edit</button>
        <button class="btn-danger" data-delete="${s.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  tableWrapper.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
          <th>Course</th><th>Enrolled</th><th>GPA</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

let currentStudents = [];

async function refresh() {
  tableWrapper.innerHTML = '<div class="loading">Loading students…</div>';
  try {
    currentStudents = await apiList();
    renderTable(currentStudents);
  } catch (err) {
    tableWrapper.innerHTML = `<div class="empty-state">Could not reach the API. Is the Django server running at ${API_BASE}? (${err.message})</div>`;
  }
}

// ---- Event wiring ----
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const clientErrors = validateClientSide();
  if (Object.keys(clientErrors).length) {
    showFieldErrors(clientErrors);
    return;
  }
  clearFieldErrors();

  const payload = {
    first_name: document.getElementById('first_name').value.trim(),
    last_name: document.getElementById('last_name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    course: document.getElementById('course').value.trim(),
    enrollment_date: document.getElementById('enrollment_date').value,
    gpa: parseFloat(document.getElementById('gpa').value),
  };

  const editingId = idField.value;
  submitBtn.disabled = true;
  try {
    if (editingId) {
      await apiUpdate(editingId, payload);
      showStatus('Student updated successfully.', 'success');
    } else {
      await apiCreate(payload);
      showStatus('Student added successfully.', 'success');
    }
    resetForm();
    await refresh();
  } catch (err) {
    if (err.fieldErrors) {
      showFieldErrors(err.fieldErrors);
      showStatus('Please fix the highlighted fields.', 'error');
    } else {
      showStatus(err.message || 'Something went wrong.', 'error');
    }
  } finally {
    submitBtn.disabled = false;
  }
});

cancelBtn.addEventListener('click', resetForm);

tableWrapper.addEventListener('click', async (e) => {
  const editId = e.target.getAttribute('data-edit');
  const deleteId = e.target.getAttribute('data-delete');

  if (editId) {
    const student = currentStudents.find(s => String(s.id) === editId);
    if (student) populateForm(student);
  }

  if (deleteId) {
    if (!confirm('Delete this student record? This cannot be undone.')) return;
    try {
      await apiDelete(deleteId);
      showStatus('Student deleted successfully.', 'success');
      await refresh();
    } catch (err) {
      showStatus(err.message || 'Failed to delete.', 'error');
    }
  }
});

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(refresh, 350);
});
orderingSelect.addEventListener('change', refresh);
refreshBtn.addEventListener('click', refresh);

// Initial load
refresh();
