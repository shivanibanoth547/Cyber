import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Upload, Send } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        const payload = new FormData();
        payload.append('fullName', formData.fullName);
        payload.append('email', formData.email);
        payload.append('password', formData.password);
        if (file) payload.append('identityDoc', file);

        setLoading(true);
        try {
            const data = await register(payload);
            setSuccess(data.message || 'Registration successful! Awaiting admin approval.');
            setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: 520 }}>
                <div className="auth-logo">
                    <div className="logo-icon">
                        <Shield size={28} color="#fff" />
                    </div>
                </div>
                <h1>Request Access</h1>
                <p className="subtitle">Submit your details for SOC platform access</p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" className="form-input" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" className="form-input" placeholder="analyst@organization.com" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" className="form-input" placeholder="Min 8 chars, uppercase, lowercase, digit, special" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" className="form-input" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Identity Document (PDF/JPG/PNG)</label>
                        <div
                            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                            onDrop={handleFileDrop}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => document.getElementById('idDocInput').click()}
                        >
                            <Upload size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                            <p>Drag & drop your ID document here or click to browse</p>
                            <p style={{ fontSize: 12, marginTop: 4, color: 'var(--text-muted)' }}>PDF, JPG, PNG — Max 10MB</p>
                            {file && <div className="file-name">✅ {file.name}</div>}
                            <input id="idDocInput" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? (
                            <>Submitting...</>
                        ) : (
                            <><Send size={16} /> Submit Registration</>
                        )}
                    </button>
                </form>

                <div className="auth-link">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
