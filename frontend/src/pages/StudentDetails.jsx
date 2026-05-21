import React from "react";
import { Link, useParams } from "react-router-dom";

const StudentDetails = () => {
    const { id } = useParams();

    const [student, setStudent] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const getStudent = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/student/${id}`
            );
            const data = await response.json();
            setStudent(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        getStudent();
    }, []);

    const groupedSemesters =
        student?.marks?.reduce((acc, mark) => {
            const semester = mark.semester.name;
            if (!acc[semester]) acc[semester] = [];
            acc[semester].push(mark);
            return acc;
        }, {}) || {};

    if (loading) {
        return (
            <div className="min-vh-100 bg-body-tertiary d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" />
                    <p className="text-muted mb-0">Loading student details...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-vh-100 bg-body-tertiary d-flex justify-content-center align-items-center">
                <div className="card border-0 shadow-sm p-5 text-center rounded-4">
                    <div
                        className="bg-body-secondary rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                        style={{ width: "80px", height: "80px", fontSize: "32px" }}
                    >
                        🎓
                    </div>
                    <h3 className="fw-semibold mb-2">Student not found</h3>
                    <p className="text-muted mb-4">
                        The student record you're looking for doesn't exist.
                    </p>
                    <Link to="/" className="btn btn-dark rounded-3 px-4">
                        ← Back to Students
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-body-tertiary min-vh-100 pb-5">

            {/* Navbar */}
            <nav
                className="navbar px-4 py-3 border-bottom border-secondary"
                style={{ background: "#0f172a" }}
            >
                <div className="container-fluid">
                    <Link to="/" className="navbar-brand fw-semibold text-white text-decoration-none">
                        edu<span style={{ color: "#818cf8" }}>flow</span>
                    </Link>
                    <span className="small" style={{ color: "#94a3b8" }}>
                        Student profile
                    </span>
                </div>
            </nav>

            <div className="container py-4" style={{ maxWidth: "900px" }}>

                {/* Back */}
                <Link
                    to="/"
                    className="btn btn-light border rounded-3 mb-4 d-inline-flex align-items-center gap-2"
                    style={{ fontSize: "13px" }}
                >
                    ← Back to Students
                </Link>

                {/* Hero */}
                <div
                    className="rounded-4 overflow-hidden mb-4 p-4 p-md-5"
                    style={{ background: "#0f172a" }}
                >
                    <div className="d-flex align-items-start gap-4">

                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
                            style={{
                                width: "72px",
                                height: "72px",
                                fontSize: "22px",
                                background: "#1e293b",
                                border: "2px solid #334155",
                                color: "#e2e8f0",
                            }}
                        >
                            {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>

                        <div>
                            <h1
                                className="fw-semibold mb-1"
                                style={{ fontSize: "22px", color: "#f1f5f9" }}
                            >
                                {student.name}
                            </h1>

                            <p
                                className="mb-4"
                                style={{ fontSize: "14px", color: "#64748b" }}
                            >
                                {student.email}
                            </p>

                            <div
                                className="text-uppercase mb-1"
                                style={{
                                    fontSize: "11px",
                                    letterSpacing: "0.08em",
                                    color: "#475569",
                                }}
                            >
                                Roll number
                            </div>

                            <div
                                className="fw-semibold"
                                style={{ fontSize: "36px", color: "#f1f5f9", lineHeight: 1 }}
                            >
                                {student.rollNo}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="row g-3 mb-4">
                    {[
                        {
                            label: "Subjects",
                            value: new Set(student.marks.map((m) => m.subject.name)).size,
                        },
                        {
                            label: "Semesters",
                            value: Object.keys(groupedSemesters).length,
                        },
                        {
                            label: "Student ID",
                            value: `#${student.id}`,
                        },
                    ].map(({ label, value }) => (
                        <div key={label} className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4">
                                    <div
                                        className="text-uppercase text-muted fw-semibold mb-2"
                                        style={{ fontSize: "11px", letterSpacing: "0.06em" }}
                                    >
                                        {label}
                                    </div>
                                    <div className="fw-semibold" style={{ fontSize: "26px" }}>
                                        {value}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Semester Cards */}
                <div className="d-flex flex-column gap-3">
                    {Object.entries(groupedSemesters).map(([semesterName, marks]) => (
                        <div
                            key={semesterName}
                            className="card border-0 shadow-sm rounded-4 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div>
                                    <h5 className="fw-semibold mb-1" style={{ fontSize: "15px" }}>
                                        {semesterName}
                                    </h5>
                                    <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                                        Subject-wise academic performance
                                    </p>
                                </div>
                                <span
                                    className="badge rounded-pill text-muted border"
                                    style={{
                                        background: "transparent",
                                        fontWeight: 400,
                                        fontSize: "12px",
                                        padding: "5px 12px",
                                    }}
                                >
                                    {marks.length} subjects
                                </span>
                            </div>

                            {/* Rows */}
                            <table className="table mb-0">
                                <tbody>
                                    {marks.map((mark) => (
                                        <tr key={mark.id}>
                                            <td className="px-4 py-3 border-0 border-bottom">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="rounded-3 bg-body-secondary text-secondary d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
                                                        style={{
                                                            width: "42px",
                                                            height: "42px",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        {mark.subject.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold" style={{ fontSize: "14px" }}>
                                                            {mark.subject.name}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: "12px" }}>
                                                            Code: {mark.subject.code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-end border-0 border-bottom">
                                                <div className="d-inline-flex flex-column align-items-end">
                                                    <span
                                                        className="fw-semibold"
                                                        style={{
                                                            fontSize: "15px",
                                                            color: "#000000",
                                                        }}
                                                    >
                                                        {mark.mark}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;