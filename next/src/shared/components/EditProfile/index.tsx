import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lock, RotateCcw } from "lucide-react";
import styles from "./index.module.scss";
import { updateProfile, clearError, clearSuccess } from "../../store/slices/settings";
import {
    selectSettingsLoading,
    selectSettingsError,
    selectSettingsSuccess,
} from "../../store/slices/settings";
import { getTests, getAvailableTests } from "../../store/slices/test";
import { RootState } from "../../store/store";
import { User } from "../../types/auth";
import { isTeacher } from "../../utils/roles";
import Modal from "../Modal";

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
        lastName: user.lastName || "",
        patronymic: user.patronymic || "",
        classNumber: user.classNumber?.toString() || "",
        classLetter: user.classLetter?.toLowerCase() || "",
    });

    const [locationNames, setLocationNames] = useState({
        region: "",
        settlement: "",
        school: "",
    });

    useEffect(() => {
        setFormData({
            name: user.name || "",
            lastName: user.lastName || "",
            patronymic: user.patronymic || "",
            classNumber: user.classNumber?.toString() || "",
            classLetter: user.classLetter?.toLowerCase() || "",
        });
    }, [user]);

    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        password: "",
        confirmPassword: "",
    });
    const [showNoChangesModal, setShowNoChangesModal] = useState(false);
    const [showClassErrorModal, setShowClassErrorModal] = useState(false);
    const [showPasswordErrorModal, setShowPasswordErrorModal] = useState(false);

    const handleProfileChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const loadLocationNames = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

                if (user.regionId) {
                    const regionsRes = await fetch(`${apiUrl}/api/regions`);
                    const regions = await regionsRes.json();
                    const region = Array.isArray(regions)
                        ? regions.find((r: any) => r.id === user.regionId)
                        : null;
                    if (region) setLocationNames((prev) => ({ ...prev, region: region.name }));
                }

                if (user.settlementId && user.regionId) {
                    const settlementsRes = await fetch(
                        `${apiUrl}/api/regions/${user.regionId}/settlements`,
                    );
                    const settlements = await settlementsRes.json();
                    const settlement = Array.isArray(settlements)
                        ? settlements.find((s: any) => s.id === user.settlementId)
                        : null;
                    if (settlement)
                        setLocationNames((prev) => ({ ...prev, settlement: settlement.name }));
                }

                if (user.schoolId && user.settlementId) {
                    const schoolsRes = await fetch(
                        `${apiUrl}/api/regions/settlement/${user.settlementId}/schools`,
                    );
                    const schools = await schoolsRes.json();
                    const school = Array.isArray(schools)
                        ? schools.find((s: any) => s.id === user.schoolId)
                        : null;
                    if (school) setLocationNames((prev) => ({ ...prev, school: school.name }));
                }
            } catch (err) {
                console.error("Failed to load location names:", err);
            }
        };

        loadLocationNames();
    }, [user.regionId, user.settlementId, user.schoolId]);

    const handleSaveProfile = async () => {
        const updateData: any = {};
        if (formData.name !== user.name) updateData.name = formData.name;
        if (formData.lastName !== user.lastName) updateData.lastName = formData.lastName;
        if (formData.patronymic !== user.patronymic) updateData.patronymic = formData.patronymic;
        if (formData.classNumber !== user.classNumber?.toString())
            updateData.classNumber = formData.classNumber ? parseInt(formData.classNumber) : null;
        if (formData.classLetter?.toUpperCase() !== user.classLetter?.toUpperCase())
            updateData.classLetter = formData.classLetter?.toUpperCase() || null;

        if (
            user.role === "student" &&
            (updateData.classNumber !== undefined || updateData.classLetter !== undefined)
        ) {
            if (!formData.classNumber || !formData.classLetter) {
                setShowClassErrorModal(true);
                return;
            }
        }

        if (showPasswordChange) {
            if (passwords.password !== passwords.confirmPassword) {
                setShowPasswordErrorModal(true);
                return;
            }
            if (!passwords.currentPassword || !passwords.password) {
                alert("Пожалуйста, заполните все поля пароля");
                return;
            }
            updateData.currentPassword = passwords.currentPassword;
            updateData.password = passwords.password;
        }

        if (Object.keys(updateData).length === 0) {
            setShowNoChangesModal(true);
            return;
        }

        dispatch(updateProfile(updateData) as any).then((action: any) => {
            if (action.meta.requestStatus === "fulfilled") {
                setPasswords({ currentPassword: "", password: "", confirmPassword: "" });
                setShowPasswordChange(false);

                const classChanged =
                    updateData.classNumber !== undefined || updateData.classLetter !== undefined;

                if (classChanged) {
                    setTimeout(() => {
                        if (isTeacher(user.role)) {
                            dispatch(getTests() as any);
                        } else {
                            dispatch(getAvailableTests() as any);
                        }
                    }, 100);
                }

                onSuccess?.();
            }
        });
    };

    useEffect(() => {
        return () => {
            dispatch(clearSuccess() as any);
            dispatch(clearError() as any);
        };
    }, [dispatch]);

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

            <Modal
                isOpen={showNoChangesModal}
                title="Нет изменений"
                message="Вы не внесли никаких изменений в профиль"
                onConfirm={() => setShowNoChangesModal(false)}
                onCancel={() => setShowNoChangesModal(false)}
                confirmText="Ок"
                hideCancel={true}
            />

            <Modal
                isOpen={showClassErrorModal}
                title="Ошибка"
                message="Пожалуйста, заполните оба поля класса"
                onConfirm={() => setShowClassErrorModal(false)}
                onCancel={() => setShowClassErrorModal(false)}
                confirmText="Ок"
                hideCancel={true}
            />

            <Modal
                isOpen={showPasswordErrorModal}
                title="Ошибка"
                message="Пароли не совпадают"
                onConfirm={() => setShowPasswordErrorModal(false)}
                onCancel={() => setShowPasswordErrorModal(false)}
                confirmText="Ок"
                hideCancel={true}
            />

            <form
                className={styles.form}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProfile();
                }}
            >
                <div className={styles.formGroup}>
                    <label htmlFor="lastName">Фамилия</label>
                    <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleProfileChange}
                        disabled={loading}
                    />
                </div>

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
                    <label htmlFor="patronymic">Отчество</label>
                    <input
                        id="patronymic"
                        type="text"
                        name="patronymic"
                        value={formData.patronymic}
                        onChange={handleProfileChange}
                        disabled={loading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={user.email} disabled />
                </div>
                <div
                    style={{
                        marginTop: "24px",
                        paddingTop: "24px",
                        borderTop: "1px solid #e0e0e0",
                    }}
                >
                    <h3 style={{ marginBottom: "16px" }}>Данные об образовательном учреждении</h3>

                    {(locationNames.region || user.regionId) && (
                        <div className={styles.formGroup}>
                            <label>Регион</label>
                            <input
                                type="text"
                                value={locationNames.region || "Загрузка..."}
                                disabled
                            />
                        </div>
                    )}

                    {(locationNames.settlement || user.settlementId) && (
                        <div className={styles.formGroup}>
                            <label>Населённый пункт</label>
                            <input
                                type="text"
                                value={locationNames.settlement || "Загрузка..."}
                                disabled
                            />
                        </div>
                    )}

                    {(locationNames.school ||
                        user.schoolId ||
                        user.educationalInstitutionCustom) && (
                        <div className={styles.formGroup}>
                            <label>Образовательное учреждение</label>
                            <input
                                type="text"
                                value={
                                    locationNames.school ||
                                    user.educationalInstitutionCustom ||
                                    "Загрузка..."
                                }
                                disabled
                            />
                        </div>
                    )}

                    {user.role === "student" && (
                        <div className={styles.classSection}>
                            <h3>Класс</h3>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label htmlFor="classNumber">Номер класса</label>
                                    <select
                                        id="classNumber"
                                        name="classNumber"
                                        value={formData.classNumber || ""}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    >
                                        <option value="">Выберите номер</option>
                                        {Array.from({ length: 11 }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label htmlFor="classLetter">Буква класса</label>
                                    <select
                                        id="classLetter"
                                        name="classLetter"
                                        value={formData.classLetter || ""}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    >
                                        <option value="">Выберите букву</option>
                                        {Array.from({ length: 32 }, (_, i) =>
                                            String.fromCharCode(1072 + i),
                                        ).map((letter) => (
                                            <option key={letter} value={letter}>
                                                {letter.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
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
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    {showPasswordChange ? (
                        <>
                            <RotateCcw size={20} />
                            Отменить
                        </>
                    ) : (
                        <>
                            <Lock size={20} />
                            Изменить пароль
                        </>
                    )}
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
