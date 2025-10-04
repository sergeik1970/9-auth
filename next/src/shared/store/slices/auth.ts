import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createApiUrl, API_ENDPOINTS } from "../../config/api";
import { User, AuthState, RegisterUserData, LoginUserData } from "../../types/auth";

const initialState: AuthState = {
    user: null,
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

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || "Ошибка входа");
            }

            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            return data.user;
        } catch (error) {
            return rejectWithValue("Ошибка входа в catch");
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
    },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
