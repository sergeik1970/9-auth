import React, { ReactElement, useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "../../store/store";
import { registerUser, loginUser, clearError, selectAuth } from "../../store/slices/auth";
import { AuthFormData } from "../../types/auth";
import Button from "@/shared/components/Button";
import AutocompleteInput from "@/shared/components/AutocompleteInput";
import { russianRegions, regionSettlements } from "@/shared/data/russianLocations";

interface Region {
    id: number;
    name: string;
}

interface Settlement {
    id: number;
    name: string;
    regionId: number;
}

interface School {
    id: number;
    name: string;
    settlementId: number;
}

const Auth = (): ReactElement => {
    const dispatch = useDispatch();
    const router = useRouter();

    const { loading, error, isAuthenticated, user } = useSelector(selectAuth);

    const [isLogin, setIsLogin] = useState(true);
    const [settlementsForRegion, setSettlementsForRegion] = useState<string[]>([]);
    const [schoolsForSettlement, setSchoolsForSettlement] = useState<string[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [schools, setSchools] = useState<School[]>([]);

    const [formData, setFormData] = useState<AuthFormData>({
        email: "",
        password: "",
        name: "",
        lastName: "",
        patronymic: "",
        region: "",
        settlement: "",
        educationalInstitution: "",
        classNumber: "",
        classLetter: "",
        role: "student",
        confirmPassword: "",
    });
    const [success, setSuccess] = useState("");
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        if (isAuthenticated && user) {
            setSuccess(`Добро пожаловать, ${user.name}!`);
            setTimeout(() => {
                router.push("/");
            }, 500);
        }
    });

    useEffect(() => {
        const loadRegions = async () => {
            try {
                const res = await fetch(`/api/regions`);

                if (!res.ok) {
                    console.error(`API returned status ${res.status}`);
                    setRegions([]);
                    return;
                }

                const data = await res.json();

                if (Array.isArray(data)) {
                    setRegions(data);
                } else if (data?.data && Array.isArray(data.data)) {
                    setRegions(data.data);
                } else {
                    console.error("Invalid API response format:", data);
                    setRegions([]);
                }
            } catch (err) {
                console.error("Failed to load regions:", err);
                setRegions([]);
            }
        };
        loadRegions();
    }, []);

    useEffect(() => {
        const loadSettlements = async () => {
            if (!formData.region || !Array.isArray(regions)) {
                setSettlementsForRegion([]);
                setSettlements([]);
                setFormData((prev) => ({ ...prev, settlement: "", educationalInstitution: "" }));
                return;
            }

            const selectedRegion = regions.find((r) => r.name === formData.region);
            if (!selectedRegion) return;

            try {
                const res = await fetch(`/api/regions/${selectedRegion.id}/settlements`);

                if (!res.ok) {
                    console.error(`Failed to load settlements: ${res.status}`);
                    setSettlementsForRegion([]);
                    setSettlements([]);
                    return;
                }

                const data = await res.json();

                if (Array.isArray(data)) {
                    setSettlements(data);
                    setSettlementsForRegion(data.map((s: Settlement) => s.name));
                } else {
                    console.error("Invalid settlements response:", data);
                    setSettlementsForRegion([]);
                    setSettlements([]);
                }

                setFormData((prev) => ({ ...prev, settlement: "", educationalInstitution: "" }));
            } catch (err) {
                console.error("Failed to load settlements:", err);
                setSettlementsForRegion([]);
                setSettlements([]);
            }
        };
        loadSettlements();
    }, [formData.region, regions]);

    useEffect(() => {
        const loadSchools = async () => {
            if (!formData.settlement || !Array.isArray(settlements)) {
                setSchoolsForSettlement([]);
                setSchools([]);
                setFormData((prev) => ({ ...prev, educationalInstitution: "" }));
                return;
            }

            const selectedSettlement = settlements.find((s) => s.name === formData.settlement);
            if (!selectedSettlement) return;

            try {
                const res = await fetch(
                    `/api/regions/settlement/${selectedSettlement.id}/schools`,
                );

                if (!res.ok) {
                    console.error(`Failed to load schools: ${res.status}`);
                    setSchoolsForSettlement([]);
                    setSchools([]);
                    return;
                }

                const data = await res.json();

                if (Array.isArray(data)) {
                    setSchools(data);
                    setSchoolsForSettlement(data.map((s: School) => s.name));
                } else {
                    console.error("Invalid schools response:", data);
                    setSchoolsForSettlement([]);
                    setSchools([]);
                }
            } catch (err) {
                console.error("Failed to load schools:", err);
                setSchoolsForSettlement([]);
                setSchools([]);
            }
        };
        loadSchools();
    }, [formData.settlement, settlements]);

    // Обработка инпутов формы
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        dispatch(clearError());
        setSuccess("");
        setValidationError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess("");
        setValidationError("");

        // Проверка данных
        if (isLogin) {
            // Проверка заполненности полей для входа
            if (!formData.email || !formData.password) {
                setValidationError("Заполните все поля");
                return;
            }

            const result = await dispatch(
                loginUser({
                    email: formData.email,
                    password: formData.password,
                }),
            );
            // Очистка формы
            if (loginUser.fulfilled.match(result)) {
                setFormData({ email: "", password: "", name: "" });
            }
        } else {
            // Проверка заполненности всех полей для регистрации
            if (
                !formData.email ||
                !formData.password ||
                !formData.name ||
                !formData.lastName ||
                !formData.region ||
                !formData.settlement ||
                !formData.educationalInstitution ||
                !formData.confirmPassword ||
                (formData.role === "teacher" && !formData.patronymic) ||
                (formData.role === "student" && (!formData.classNumber || !formData.classLetter))
            ) {
                setValidationError("Заполните все поля");
                return;
            }

            // Проверка совпадения паролей
            if (formData.password !== formData.confirmPassword) {
                setValidationError("Пароли не совпадают");
                return;
            }

            const selectedRegion = regions.find((r) => r.name === formData.region);
            const selectedSettlement = settlements.find((s) => s.name === formData.settlement);
            const selectedSchool = schools.find((s) => s.name === formData.educationalInstitution);

            const result = await dispatch(
                registerUser({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    lastName: formData.lastName!,
                    patronymic: formData.role === "teacher" ? formData.patronymic : undefined,
                    regionId: selectedRegion?.id,
                    settlementId: selectedSettlement?.id,
                    schoolId: selectedSchool?.id,
                    educationalInstitutionCustom: selectedSchool
                        ? undefined
                        : formData.educationalInstitution,
                    classNumber:
                        formData.role === "student" ? parseInt(formData.classNumber!) : undefined,
                    classLetter: formData.role === "student" ? formData.classLetter : undefined,
                    role: formData.role || "student",
                }),
            );

            if (registerUser.fulfilled.match(result)) {
                setFormData({
                    email: "",
                    password: "",
                    name: "",
                    lastName: "",
                    patronymic: "",
                    region: "",
                    settlement: "",
                    educationalInstitution: "",
                    classNumber: "",
                    classLetter: "",
                    role: "student",
                    confirmPassword: "",
                });
            }
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            email: "",
            password: "",
            name: "",
            lastName: "",
            patronymic: "",
            region: "",
            settlement: "",
            educationalInstitution: "",
            classNumber: "",
            classLetter: "",
            role: "student",
            confirmPassword: "",
        });
        dispatch(clearError());
        setSuccess("");
        setValidationError("");
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>{isLogin ? "Вход в систему" : "Регистрация"}</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLogin && (
                        <>
                            <div className={styles.inputGroup}>
                                <label htmlFor="role">Роль:</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role || "student"}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                    className={styles.input}
                                >
                                    <option value="student">Ученик</option>
                                    <option value="teacher">Учитель</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="lastName">Фамилия:</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Введите вашу фамилию"
                                    value={formData.lastName || ""}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="name">Имя:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Введите ваше имя"
                                    value={formData.name || ""}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                    className={styles.input}
                                />
                            </div>

                            {formData.role === "teacher" && (
                                <div className={styles.inputGroup}>
                                    <label htmlFor="patronymic">Отчество:</label>
                                    <input
                                        type="text"
                                        id="patronymic"
                                        name="patronymic"
                                        placeholder="Введите ваше отчество"
                                        value={formData.patronymic || ""}
                                        onChange={handleInputChange}
                                        required={formData.role === "teacher"}
                                        disabled={loading}
                                        className={styles.input}
                                    />
                                </div>
                            )}

                            <div className={styles.inputGroup}>
                                <label htmlFor="region">Регион:</label>
                                <AutocompleteInput
                                    id="region"
                                    name="region"
                                    placeholder="Начните вводить регион"
                                    value={formData.region || ""}
                                    onChange={handleInputChange}
                                    suggestions={
                                        Array.isArray(regions) ? regions.map((r) => r.name) : []
                                    }
                                    required
                                    disabled={loading}
                                    minChars={1}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="settlement">Населённый пункт:</label>
                                <AutocompleteInput
                                    id="settlement"
                                    name="settlement"
                                    placeholder="Начните вводить населённый пункт"
                                    value={formData.settlement || ""}
                                    onChange={handleInputChange}
                                    suggestions={settlementsForRegion}
                                    required
                                    disabled={loading || !formData.region}
                                    minChars={1}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="educationalInstitution">
                                    Образовательное учреждение:
                                </label>
                                <AutocompleteInput
                                    id="educationalInstitution"
                                    name="educationalInstitution"
                                    placeholder="Выберите школу из списка"
                                    value={formData.educationalInstitution || ""}
                                    onChange={handleInputChange}
                                    suggestions={schoolsForSettlement}
                                    required
                                    disabled={loading || !formData.settlement}
                                    minChars={1}
                                    strictMode={true}
                                />
                            </div>

                            {formData.role === "student" && (
                                <div style={{ display: "flex", gap: "16px" }}>
                                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                                        <label htmlFor="classNumber">Класс (цифра):</label>
                                        <select
                                            id="classNumber"
                                            name="classNumber"
                                            value={formData.classNumber || ""}
                                            onChange={handleInputChange}
                                            required={formData.role === "student"}
                                            disabled={loading}
                                            className={styles.input}
                                        >
                                            <option value="">Выберите класс</option>
                                            {Array.from({ length: 11 }, (_, i) => i + 1).map(
                                                (num) => (
                                                    <option key={num} value={num}>
                                                        {num}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>

                                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                                        <label htmlFor="classLetter">Класс (буква):</label>
                                        <select
                                            id="classLetter"
                                            name="classLetter"
                                            value={formData.classLetter || ""}
                                            onChange={handleInputChange}
                                            required={formData.role === "student"}
                                            disabled={loading}
                                            className={styles.input}
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
                            )}
                        </>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Эл почта:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Введите ваш email"
                            value={formData.email || ""}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Пароль:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Введите пароль"
                            value={formData.password || ""}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            className={styles.input}
                        />
                    </div>

                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Подтвердите пароль:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Повторите пароль"
                                value={formData.confirmPassword || ""}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                className={styles.input}
                            />
                        </div>
                    )}

                    {(error || validationError) && (
                        <div className={styles.error}>{validationError || error}</div>
                    )}
                    {success && <div className={styles.success}>{success}</div>}

                    <Button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
                    </Button>
                </form>

                <div className={styles.toggleMode}>
                    <p>
                        {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                        <button
                            type="button"
                            onClick={toggleMode}
                            className={styles.toggleButton}
                            disabled={loading}
                        >
                            {isLogin ? "Зарегистрироваться" : "Войти"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
