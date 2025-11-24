import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.scss";
import { updateProfile, clearError, clearSuccess } from "../../store/slices/settings";
import {
    selectSettingsLoading,
    selectSettingsError,
    selectSettingsSuccess,
} from "../../store/slices/settings";
import { RootState } from "../../store/store";
import { User } from "../../types/auth";

interface EditProfileProps {
    user: User;
    onClose?: () => void;
    onSuccess?: () => void;
}

export default function EditProfile({ user, onClose, onSuccess }: EditProfileProps) {
    const dispatch = useDispatch();
    const loading = useSelector(selectSettingsLoading);
    const error = useSelector(selectSettingsError);
    const success = useSelector(selectSettingsSuccess);

    const [formData, setFormData] = useState({
        name: user.name || "",
        avatar: user.avatar || "",
    });

    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        password: "",
        confirmPassword: "",
    });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        const updateData: any = {};
        if (formData.name !== user.name) updateData.name = formData.name;
        if (formData.avatar !== user.avatar) updateData.avatar = formData.avatar;

        if (showPasswordChange) {
            if (passwords.password !== passwords.confirmPassword) {
                alert("Пароли не совпадают");
                return;
            }
            if (!passwords.currentPassword || !passwords.password) {
                alert("Заполните все поля пароля");
                return;
            }
            updateData.currentPassword = passwords.currentPassword;
            updateData.password = passwords.password;
        }

        if (Object.keys(updateData).length === 0) {
            alert("Нет изменений для сохранения");
            return;
        }

        dispatch(updateProfile(updateData) as any).then((action: any) => {
            if (action.type === "settings/updateProfile/fulfilled") {
                setPasswords({ currentPassword: "", password: "", confirmPassword: "" });
                setShowPasswordChange(false);
                onSuccess?.();
            }
        });
    };

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                dispatch(clearSuccess() as any);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, dispatch]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError() as any);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    return (
        <div className={styles.container}>
            <h2>Редактирование профиля</h2>

            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>Профиль успешно обновлён</div>}

            <form
                className={styles.form}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProfile();
                }}
            >
                <div className={styles.formGroup}>
                    <label htmlFor="name">Имя</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleProfileChange}
                        disabled={loading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={user.email} disabled />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="avatar">Аватар (URL)</label>
                    <input
                        id="avatar"
                        type="text"
                        name="avatar"
                        value={formData.avatar}
                        onChange={handleProfileChange}
                        placeholder="https://..."
                        disabled={loading}
                    />
                    {formData.avatar && (
                        <div className={styles.avatarPreview}>
                            <img src={formData.avatar} alt="Avatar preview" />
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#4a90e2",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: 0,
                        fontSize: "14px",
                    }}
                >
                    {showPasswordChange ? "❌ Отменить" : "🔐 Изменить пароль"}
                </button>

                {showPasswordChange && (
                    <div className={styles.passwordSection}>
                        <div className={styles.formGroup}>
                            <label htmlFor="currentPassword">Текущий пароль</label>
                            <input
                                id="currentPassword"
                                type="password"
                                name="currentPassword"
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Новый пароль</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={passwords.password}
                                onChange={handlePasswordChange}
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Подтвердите пароль</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                disabled={loading}
                            />
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button type="submit" className={styles.save} disabled={loading}>
                        {loading ? "Сохранение..." : "Сохранить"}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            className={styles.cancel}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Отмена
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
