import { useEffect, useState } from 'react';
import { getAdminUsers, updateUserRole } from '../api/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Admin() {
    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState('');

    const loadUsers = async () => {
        try {
            setError('');

            const res = await getAdminUsers();

            setUsers(res.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to load users.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            loadUsers();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleRoleChange = async (userId, role) => {
        try {
            setUpdating(userId);
            setError('');

            const res = await updateUserRole(userId, role);

            const updatedUser = res.data.data;

            setUsers((currentUsers) =>
                currentUsers.map((item) =>
                    Number(item.id) === Number(updatedUser.id)
                        ? updatedUser
                        : item
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to update user role.'
            );
        } finally {
            setUpdating(null);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="page">
                <div className="form-card">
                    <h2>Access Denied</h2>

                    <p>
                        You must be an administrator to view
                        this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="page-header">
                <div>
                    <p className="eyebrow">
                        ADMINISTRATION
                    </p>

                    <h1>User Management</h1>

                    <p>
                        Manage user roles and reviewer access.
                    </p>
                </div>
            </div>

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            {loading ? (
                <div className="card">
                    <p>Loading users...</p>
                </div>
            ) : (
                <div className="card">

                    <div className="admin-user-list">

                        {users.map((item) => {
                            const isCurrentUser =
                                Number(item.id) === Number(user.id);

                            return (
                                <div
                                    className="admin-user-row"
                                    key={item.id}
                                >

                                    <div className="admin-user-info">

                                        <strong>
                                            {item.name}
                                        </strong>

                                        <span>
                                            {item.email}
                                        </span>

                                        <small>
                                            User #{item.id}
                                        </small>

                                    </div>

                                    <div className="admin-user-actions">

                                        <span
                                            className={`role-badge role-${item.role}`}
                                        >
                                            {item.role}
                                        </span>

                                        {isCurrentUser ? (
                                            <span className="muted">
                                                Current account
                                            </span>
                                        ) : (
                                            <select
                                                value={item.role}
                                                disabled={
                                                    updating === item.id
                                                }
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        item.id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="submitter">
                                                    Submitter
                                                </option>

                                                <option value="reviewer">
                                                    Reviewer
                                                </option>
                                            </select>
                                        )}

                                    </div>

                                </div>
                            );
                        })}

                        {users.length === 0 && (
                            <p>No users found.</p>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}