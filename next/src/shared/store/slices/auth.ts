import {
    createSlice,
    createAsyncThunk,
    PayloadAction,
    isRejectedWithValue,
} from "@reduxjs/toolkit";
import { createApiUrl, API_ENDPOINTS } from "../../config/api";
import { User, AuthState, RegisterUserData, LoginUserData } from "../../types/auth";
import { RootState } from "../store";

const initialState: AuthState = {
    user: null,
    // role: "",
    // id: 1, // Запрос который получает инфe о пользователе
    // },
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData: RegisterUserData, { rejectWithValue }) => {
        try {
            const response = await fetch(createApiUrl(API_ENDPOINTS.auth.register), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            console.log("registerUser response:", data);
            console.log("registerUser data.user:", data.user);
            console.log("registerUser data.user?.role:", data.user?.role);

            if (!response.ok) {
                return rejectWithValue(data.message || "Ошибка регистрации");
            }

            return data.user;
        } catch (error) {
            console.error("registerUser error:", error);
            return rejectWithValue("Ошибка регистрации в catch");
        }
    },
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (userData: LoginUserData, { rejectWithValue }) => {
        try {
            const response = await fetch(createApiUrl(API_ENDPOINTS.auth.login), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(userData),
            });

            // Получаем ответ от сервера
            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || "Ошибка входа");
            }

            // if (data.token) {
            //     localStorage.setItem("token", data.token);
            // }

            return data.user;
        } catch (error) {
            return rejectWithValue("Ошибка входа в catch");
        }
    },
);

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(createApiUrl(API_ENDPOINTS.auth.logout), {
            method: "POST",
            credentials: "include",
        });
        if (!response.ok) {
            return rejectWithValue("Ошибка выхода");
        }

        // localStorage.removeItem("token");

        return null;
    } catch (error) {
        return isRejectedWithValue("Ошибка соединения с сервером в catch");
    }
});

export const getCurrentUser = createAsyncThunk(
    "auth/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            // Получаем токен
            // Токен не получаем, он теперь в httpOnly cookie
            // const token = localStorage.getItem("token");

            // if (!token) {
            //     return rejectWithValue("Токен не найден");
            // }

            const response = await fetch(createApiUrl(API_ENDPOINTS.auth.me), {
                method: "GET",
                // headers: {
                //     Authorization: `Bearer ${token}`,
                // },
                credentials: "include",
            });

            const data = await response.json();
            console.log("getCurrentUser response:", data);
            console.log("getCurrentUser data.user:", data.user);
            console.log("getCurrentUser data.user?.role:", data.user?.role);

            if (!response.ok) {
                return rejectWithValue(data.message || "Пользователь не авторизован");
            }

            return data.user;
        } catch (error) {
            console.error("getCurrentUser error:", error);
            return rejectWithValue("Ошибка соединения с сервером в catch");
        }
    },
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        clearAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        // Logout
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        // Get Current User
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                // state.error = action.payload as string;
            });
    },
});

export const { clearError, clearAuth } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
