import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", email: "", rollNo: "" });
  const [formErrors, setFormErrors] = React.useState({});
  const [toast, setToast] = React.useState(null);
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState(null);

  const handlePagination = (page) => { setCurrentPage(page); setLoading(true); };

  const getStudents = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/student?page=${currentPage}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();
      setStudents(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { setLoading(true); getStudents(); }, [currentPage]);

  const openModal = () => { setFormData({ name: "", email: "", rollNo: "" }); setFormErrors({}); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const openDeleteModal = (student) => { setStudentToDelete(student); setDeleteModal(true); };
  const closeDeleteModal = () => setDeleteModal(false);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/student/${studentToDelete.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      //filter out the deleted student from the students array
      setStudents(students.filter(student => student.id !== studentToDelete.id));
    } catch (e) { console.error(e); }
    finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Full name is required.";
    if (!formData.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email.";
    if (!formData.rollNo.trim()) e.rollNo = "Roll number is required.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors(p => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/student`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      closeModal(); setLoading(true); await getStudents();
      setToast({ msg: "Student added successfully.", type: "success" });
    } catch { setToast({ msg: "Something went wrong. Please try again.", type: "danger" }); }
    finally { setSubmitting(false); setTimeout(() => setToast(null), 3500); }
  };

  const initials = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // Native Bootstrap contextual backgrounds for the avatars
  const bgContexts = ["primary", "secondary", "success", "danger", "warning", "info", "dark"];
  const getAvatarBg = (id) => bgContexts[id % bgContexts.length];

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="text-muted small mb-0">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* ── Toast (Uses standard Bootstrap Toast styles positioned dynamically) ── */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
          <div className={`toast show align-items-center text-white bg-${toast.type} border-0`} role="alert">
            <div className="d-flex">
              <div className="toast-body fw-bold">
                <span className="me-2">{toast.type === "success" ? "✓" : "✕"}</span>
                {toast.msg}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeDeleteModal}>
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={e => e.stopPropagation()}>
              <div className="modal-content shadow-lg border-0">
                <div className="modal-header bg-dark text-white">
                  <div>
                    <h5 className="modal-title fw-bold">Delete Student <strong className="text-danger">{studentToDelete?.name}</strong></h5>
                    <small className="text-white-50">Are you sure you want to delete this student?</small>
                  </div>
                  <button type="button" className="btn-close btn-close-white" onClick={closeDeleteModal} aria-label="Close" />
                </div>
                <div className="modal-body">
                  <p>This action cannot be undone.</p>
                </div>
                <div className="modal-footer bg-light border-top">
                  <button className="btn btn-outline-secondary" onClick={closeDeleteModal}>Cancel</button>
                  <button className="btn btn-danger fw-bold" onClick={handleDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modal (Uses native Bootstrap structure powered by state) ── */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeModal}>
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={e => e.stopPropagation()}>
              <div className="modal-content shadow-lg border-0">
                <div className="modal-header bg-dark text-white">
                  <div>
                    <h5 className="modal-title fw-bold">Add New Student</h5>
                    <small className="text-white-50">Enter the student's information below.</small>
                  </div>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal} disabled={submitting} aria-label="Close" />
                </div>

                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted">Full Name <span className="text-danger">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      placeholder="e.g. Priya Sharma"
                      className={`form-control ${formErrors.name ? "is-invalid" : ""}`} />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted">Email Address <span className="text-danger">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="e.g. priya@example.com"
                      className={`form-control ${formErrors.email ? "is-invalid" : ""}`} />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>
                  <div className="mb-0">
                    <label className="form-label small fw-bold text-uppercase text-muted">Roll Number <span className="text-danger">*</span></label>
                    <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange}
                      placeholder="e.g. CS-2024-042"
                      className={`form-control ${formErrors.rollNo ? "is-invalid" : ""}`} />
                    {formErrors.rollNo && <div className="invalid-feedback">{formErrors.rollNo}</div>}
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button className="btn btn-outline-secondary" onClick={closeModal} disabled={submitting}>Cancel</button>
                  <button className="btn btn-primary px-4 fw-bold" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Saving…
                      </>
                    ) : (
                      "+ Add Student"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Navbar ── */}
      <nav className="navbar navbar-dark bg-dark px-4 py-3 border-bottom border-secondary">
        <span className="navbar-brand mb-0 h1 fw-black">edu<span className="text-primary">flow</span></span>
        <span className="navbar-text text-muted small fw-bold text-uppercase">Admin Dashboard</span>
      </nav>

      {/* ── Main Container ── */}
      <div className="container py-4" style={{ maxWidth: "960px" }}>

        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="h3 fw-bold text-dark mb-0">Students</h1>
            <p className="text-muted small mb-0 mt-1">Manage your enrolled student records</p>
          </div>
          <button className="btn btn-primary fw-bold px-4" onClick={openModal}>+ Add Student</button>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card h-100 border-light shadow-sm p-3">
              <div className="small text-uppercase text-muted fw-bold mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>On This Page</div>
              <div className="h3 fw-bold text-dark mb-0">{students.length}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card h-100 border-light shadow-sm p-3">
              <div className="small text-uppercase text-muted fw-bold mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Total Pages</div>
              <div className="h3 fw-bold text-dark mb-0">{totalPages}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card h-100 border-light shadow-sm p-3">
              <div className="small text-uppercase text-muted fw-bold mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Current Page</div>
              <div className="h3 fw-bold text-dark mb-0">{currentPage}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card h-100 border-light shadow-sm p-3">
              <div className="small text-uppercase text-muted fw-bold mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Status</div>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: "10px", height: "10px" }} />
                <span className="small fw-bold text-dark">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card border-0 shadow-sm overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase small text-muted">
                <tr>
                  <th className="ps-4 py-3" style={{ fontSize: "0.7rem" }}>ID</th>
                  <th className="py-3" style={{ fontSize: "0.7rem" }}>Student</th>
                  <th className="py-3" style={{ fontSize: "0.7rem" }}>Email</th>
                  <th className="py-3" style={{ fontSize: "0.7rem" }}>Roll No</th>
                  <th className="py-3" style={{ fontSize: "0.7rem" }}>Enrolled</th>
                  <th className="pe-4 py-3 text-end" style={{ fontSize: "0.7rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="d-flex flex-column align-items-center justify-content-center py-5">

                        <div
                          className="bg-light border rounded-circle d-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: "72px",
                            height: "72px",
                            fontSize: "28px",
                          }}
                        >
                          🎓
                        </div>

                        <h5 className="fw-bold text-dark mb-2">
                          No students found
                        </h5>

                        <p
                          className="text-muted text-center mb-4"
                          style={{ maxWidth: "320px" }}
                        >
                          There are no student records available right now.
                          Start by adding your first student.
                        </p>

                        <button
                          className="btn btn-primary px-4 fw-semibold"
                          onClick={openModal}
                        >
                          + Add Student
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id}>
                      <td className="ps-4">
                        <span className="text-muted small fw-bold">#{s.id}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={`rounded d-flex align-items-center justify-content-center text-white fw-bold bg-${getAvatarBg(s.id)}`} style={{ width: "32px", height: "32px", fontSize: "0.75rem" }}>
                            {initials(s.name)}
                          </div>
                          <Link
                            to={`/student/${s.id}`}
                            className="fw-semibold text-dark small text-decoration-none"
                          >
                            {s.name}
                          </Link>
                        </div>
                      </td>
                      <td><span className="text-muted small">{s.email}</span></td>
                      <td>
                        <span className="badge bg-indigo-subtle border border-indigo text-primary small rounded px-2 py-1">
                          {s.rollNo}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <button className="btn btn-sm btn-outline-secondary me-2 fw-semibold">Edit</button>
                        <button onClick={() => openDeleteModal(s)} className="btn btn-sm btn-outline-danger fw-semibold">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <p className="small text-muted mb-0">
            Page <strong className="text-dark">{currentPage}</strong> of{" "}
            <strong className="text-dark">{totalPages}</strong>
          </p>
          <div className="btn-group shadow-sm">
            <button className="btn btn-white btn-outline-secondary border-end-0 small px-3 py-2 fw-semibold" onClick={() => handlePagination(currentPage - 1)} disabled={currentPage === 1}>
              ← Prev
            </button>
            <button className="btn btn-primary px-3 py-2 fw-bold" disabled>
              {currentPage}
            </button>
            <button className="btn btn-white btn-outline-secondary border-start-0 small px-3 py-2 fw-semibold" onClick={() => handlePagination(currentPage + 1)} disabled={currentPage === totalPages}>
              Next →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;