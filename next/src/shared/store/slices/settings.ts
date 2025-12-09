import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, GradingCriteria } from "../../types/auth";
import { RootState } from "../store";

export interface UpdateProfileData {
    name?: string;
    avatar?: string;
    password?: string;
    currentPassword?: string;
    classNumber?: number | null;
    classLetter?: string | null;
    lastName?: string;
    patronymic?: string;
}

export interface UpdateGradingCriteriaData {
    gradingCriteria: GradingCriteria;
}

export interface SettingsState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

const initialState: SettingsState = {
    loading: false,
    error: null,
    success: false,
};

export const updateProfile = createAsyncThunk(
    "settings/updateProfile",
    async (data: UpdateProfileData, { rejectWithValue }) => {
        try {
            const response = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                return rejectWithValue(responseData.message || "Ошибка обновления профиля");
            }

            return responseData.user;
        } catch (error) {
            console.error("updateProfile error:", error);
            return rejectWithValue("Ошибка обновления профиля");
        }
    },
);

export const updateGradingCriteria = createAsyncThunk(
    "settings/updateGradingCriteria",
    async (data: UpdateGradingCriteriaData, { rejectWithValue }) => {
        try {
            const response = await fetch("/api/auth/grading-criteria", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                return rejectWithValue(
                    responseData.message || "Ошибка обновления критериев оценок",
                );
            }

            return responseData.user;
        } catch (error) {
            console.error("updateGradingCriteria error:", error);
            return rejectWithValue("Ошибка обновления критериев оценок");
        }
    },
);

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateGradingCriteria.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateGradingCriteria.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(updateGradingCriteria.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSuccess } = settingsSlice.actions;

export const selectSettingsLoading = (state: RootState) => state.settings.loading;
export const selectSettingsError = (state: RootState) => state.settings.error;
export const selectSettingsSuccess = (state: RootState) => state.settings.success;

export default settingsSlice.reducer;
