import {
    createSlice,
    createAsyncThunk,
    PayloadAction,
    isRejectedWithValue,
} from "@reduxjs/toolkit";
import { createApiUrl, API_ENDPOINTS } from "../../config/api";
import { User, AuthState, RegisterUserData, LoginUserData } from "../../types/auth";
import { RootState } from "../store";
import { updateProfile } from "./settings";

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false,
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

            if (!response.ok) {
                return rejectWithValue(data.message || "Ошибка регистрации");
            }

            return data.user;
        } catch (error) {
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

        return null;
    } catch (error) {
        return isRejectedWithValue("Ошибка соединения с сервером в catch");
    }
});

export const getCurrentUser = createAsyncThunk(
    "auth/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(createApiUrl(API_ENDPOINTS.auth.me), {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || "Пользователь не авторизован");
            }

            return data.user;
        } catch (error) {
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
                state.initialized = true;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.initialized = true;
                // state.error = action.payload as string;
            });
        builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
            if (state.user) {
                state.user = action.payload;
            }
        });
    },
});

export const { clearError, clearAuth } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
