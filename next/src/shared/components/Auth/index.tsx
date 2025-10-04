import React, { ReactElement, useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "../../store/store";
import { registerUser, loginUser, clearError } from "../../store/slices/auth";
import { AuthFormData } from "../../types/auth";
// import InputText from "@/shared/components/InputText";
import Button from "@/shared/components/Button";
// import { divide } from "lodash";

const Auth = (): ReactElement => {
    const dispatch = useDispatch();
    const router = useRouter();

    const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

    const [isLogin, setIsLogin] = useState(true);

    const [formData, setFormData] = useState<AuthFormData>({
        email: "",
        password: "",
        name: "",
    });
    const [success, setSuccess] = useState("");

    // Тут будет перенаправление после входа и регистрации
    useEffect(() => {
        if (isAuthenticated && user) {
            setSuccess(`Добро пожаловать, ${user.name}!`);
            setTimeout(() => {
                router.push("/");
            }, 500);
        }
    });

    // Обработка инпутов формы
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        dispatch(clearError());
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess("");

        // Проверка данных
        if (isLogin) {
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
            // Проверка имени пользователя
            if (!formData.name) {
                return alert("Введите имя");
            }

            const result = await dispatch(
                // Диспатч регистрации
                registerUser({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                }),
            );

            // Очистка формы
            if (registerUser.fulfilled.match(result)) {
                setFormData({ email: "", password: "", name: "" });
            }
        }
    };

    // Переключение между входом и регистрацией
    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({ email: "", password: "", name: "" });
        dispatch(clearError());
        setSuccess("");
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>{isLogin ? "Вход в систему" : "Регистрация"}</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Имя для регистрации */}
                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="name">Имя:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name || ""}
                                onChange={handleInputChange}
                                required={!isLogin}
                                disabled={loading}
                                className={styles.input}
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Эл почта:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
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
                            value={formData.password || ""}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            className={styles.input}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                    {success && <div className={styles.success}>{success}</div>}

                    <button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
                    </button>
                </form>

                <div className={styles.toggleMode}>
                    <p>
                        {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                        <Button
                            type="button"
                            onClick={toggleMode}
                            className={styles.toggleMode}
                            disabled={loading}
                        >
                            {isLogin ? "Зарегистрироваться" : "Войти"}
                        </Button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
