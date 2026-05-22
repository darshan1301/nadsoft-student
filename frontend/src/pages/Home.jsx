import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import swal from "sweetalert";

const Home = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    rollNo: "",
  });
  const [formErrors, setFormErrors] = React.useState({});
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editingStudentId, setEditingStudentId] = React.useState(null);

  const handlePagination = (page) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const getStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/student?page=${currentPage}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();
      setStudents(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getStudents();
  }, [currentPage]);

  const openModal = () => {
    setIsEditMode(false);
    setEditingStudentId(null);
    setFormData({ name: "", email: "", rollNo: "" });
    setFormErrors({});
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleEditClick = async (data) => {
    setFormErrors({});
    setIsEditMode(true);
    setEditingStudentId(data.id);

    try {
      if (data) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          rollNo: data.rollNo || "",
        });
        setShowModal(true);
      }
    } catch (e) {
      console.error(e);
      swal({
        title: "Failed!",
        text: "Failed to fetch student details!",
        icon: "error",
      });
    }
  };

  // Replace your old openDeleteModal and handleDelete with this single function:
  const handleDelete = (student) => {
    swal({
      title: `Delete student: ${student.name}?`,
      text: "This action cannot be undone and will permanently remove the record.",
      icon: "warning",
      buttons: {
        cancel: {
          text: "Cancel",
          value: null,
          visible: true,
          className: "btn btn-outline-secondary",
          closeModal: true,
        },
        confirm: {
          text: "Yes, delete it!",
          value: true,
          visible: true,
          className: "btn btn-danger fw-bold",
          closeModal: true,
        },
      },
      dangerMode: true, // Highlights the confirm button in red automatically
    }).then(async (willDelete) => {
      // willDelete will be true if they clicked "Yes, delete it!"
      if (willDelete) {
        try {
          setLoading(true);
          const res = await fetch(
            `${import.meta.env.VITE_BASE_URL}/api/student/${student.id}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            },
          );

          if (!res.ok) throw new Error("Failed to delete student.");

          // Filter out the deleted student from state instantly
          setStudents((prev) => prev.filter((s) => s.id !== student.id));

          // Success Alert using your library's template structure
          swal("Deleted!", "The student record has been removed.", "success");
        } catch (e) {
          console.error(e);
          swal("Error!", "Something went wrong while deleting.", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Full name is required.";
    if (!formData.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Enter a valid email.";
    if (!formData.rollNo.trim()) e.rollNo = "Roll number is required.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);

    const url = isEditMode
      ? `${import.meta.env.VITE_BASE_URL}/api/student/${editingStudentId}`
      : `${import.meta.env.VITE_BASE_URL}/api/student`;

    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      closeModal();
      setLoading(true);
      await getStudents();

      // 1. Success SweetAlert
      swal({
        title: "Success!",
        text: isEditMode
          ? "Student updated successfully."
          : "Student added successfully.",
        icon: "success",
        button: "OK", // Standard confirmation button
      });
    } catch (error) {
      console.error(error);

      // 2. Error SweetAlert
      swal({
        title: "Error!",
        text: "Something went wrong. Please try again.",
        icon: "error",
        button: "Close",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading)
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted small mb-0">Loading…</p>
        </div>
      </div>
    );

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* ── Modal (Uses native Bootstrap structure powered by state) ── */}
      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={closeModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content shadow-lg border-0">
                <div className="modal-header bg-dark text-white">
                  <div>
                    <h5 className="modal-title fw-bold">
                      {isEditMode
                        ? "Update Student Profile"
                        : "Add New Student"}
                    </h5>
                    <small className="text-white-50">
                      {isEditMode
                        ? "Modify existing student details below."
                        : "Enter the student's information below."}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeModal}
                    disabled={submitting}
                    aria-label="Close"
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Priya Sharma"
                      className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                    />
                    {formErrors.name && (
                      <div className="invalid-feedback">{formErrors.name}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. priya@example.com"
                      className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback">{formErrors.email}</div>
                    )}
                  </div>
                  <div className="mb-0">
                    <label className="form-label small fw-bold text-uppercase text-muted">
                      Roll Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                      placeholder="e.g. CS-2024-042"
                      className={`form-control ${formErrors.rollNo ? "is-invalid" : ""}`}
                    />
                    {formErrors.rollNo && (
                      <div className="invalid-feedback">
                        {formErrors.rollNo}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer bg-light border-top">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary px-4 fw-bold"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Saving…
                      </>
                    ) : isEditMode ? (
                      "Update"
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
        <span className="navbar-brand mb-0 h1 fw-black">
          edu<span className="text-primary">flow</span>
        </span>
        <span className="navbar-text text-muted small fw-bold text-uppercase">
          Admin Dashboard
        </span>
      </nav>

      {/* ── Main Container ── */}
      <div className="container py-4" style={{ maxWidth: "960px" }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="h3 fw-bold text-dark mb-0">Students</h1>
            <p className="text-muted small mb-0 mt-1">
              Manage your enrolled student records
            </p>
          </div>
          <button className="btn btn-primary fw-bold px-4" onClick={openModal}>
            + Add Student
          </button>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card h-100 border-light shadow-sm p-3">
              <div
                className="small text-uppercase text-muted fw-bold mb-1"
                style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}
              >
                On This Page
              </div>
              <div className="h3 fw-bold text-dark mb-0">{students.length}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card h-100 border-light shadow-sm p-3">
              <div
                className="small text-uppercase text-muted fw-bold mb-1"
                style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}
              >
                Total Pages
              </div>
              <div className="h3 fw-bold text-dark mb-0">{totalPages}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card h-100 border-light shadow-sm p-3">
              <div
                className="small text-uppercase text-muted fw-bold mb-1"
                style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}
              >
                Current Page
              </div>
              <div className="h3 fw-bold text-dark mb-0">{currentPage}</div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card border-0 shadow-sm overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase small text-muted">
                <tr>
                  <th className="py-3 px-6" style={{ fontSize: "0.7rem" }}>
                    Student
                  </th>
                  <th className="py-3" style={{ fontSize: "0.7rem" }}>
                    Email
                  </th>
                  <th className="py-3" style={{ fontSize: "0.7rem" }}>
                    Roll No
                  </th>
                  <th className="py-3" style={{ fontSize: "0.7rem" }}>
                    Enrolled
                  </th>
                  <th
                    className="pe-4 py-3 text-end"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Actions
                  </th>
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
                    <tr key={s.id} className="align-middle">
                      <td className="py-3">
                        <Link
                          to={`/student/${s.id}`}
                          className="d-flex align-items-center gap-2 text-decoration-none w-auto"
                        >
                          <div
                            className="rounded bg-secondary-subtle text-secondary d-flex align-items-center justify-content-center fw-semibold"
                            style={{
                              width: 30,
                              height: 30,
                              fontSize: "0.7rem",
                            }}
                          >
                            {initials(s.name)}
                          </div>
                          <span className="fw-semibold text-dark small">
                            {s.name}
                          </span>
                          <span className="bi bi-info-circle"></span>
                        </Link>
                      </td>

                      <td className="py-3">
                        <span className="text-secondary small">{s.email}</span>
                      </td>

                      <td className="py-3">
                        <span className="badge bg-light border text-secondary fw-normal font-monospace">
                          {s.rollNo}
                        </span>
                      </td>

                      <td className="py-3">
                        <span className="text-secondary small">
                          {new Date(s.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      <td className="pe-4 py-3 text-end">
                        <button
                          onClick={() => handleEditClick(s)}
                          className="btn btn-sm btn-outline-secondary me-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Delete
                        </button>
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
            <button
              className="btn btn-white btn-outline-secondary border-end-0 small px-3 py-2 fw-semibold"
              onClick={() => handlePagination(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>
            <button className="btn btn-primary px-3 py-2 fw-bold" disabled>
              {currentPage}
            </button>
            <button
              className="btn btn-white btn-outline-secondary border-start-0 small px-3 py-2 fw-semibold"
              onClick={() => handlePagination(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
