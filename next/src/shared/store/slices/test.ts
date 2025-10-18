import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Test } from "@/shared/types/test";
import { createApiUrl, API_ENDPOINTS } from "@/shared/config/api";
import { CreateTestData } from "@/shared/types/test";
import { RootState } from "../store";

// Определение типа состояния
interface TestsState {
    items: Test[];
    loading: boolean;
    error: string | null;
    selectedTest?: Test | null;
    selectedLoading: boolean;
}

// Начальное состояние
const initialState: TestsState = {
    items: [],
    loading: false,
    error: null,
    selectedTest: null,
    selectedLoading: false,
};

// Создание асинхронного thunk для получения тестов
export const getTests = createAsyncThunk("tests/getTests", async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(createApiUrl("/api/tests"));

        if (!response.ok) {
            throw new Error(`Ошибка при загрузке тестов: ${response.status}`);
        }

        const data = await response.json();
        return data as Test[];
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Ошибка загрузки тестов");
    }
});

export const getTestById = createAsyncThunk(
    "tests/getTestById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await fetch(`${createApiUrl(API_ENDPOINTS.tests.getById(id))}`);

            if (!response.ok) {
                throw new Error(`Ошибка при загрузке теста по ID: ${response.status}`);
            }

            const data = await response.json();
            return data as Test;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка загрузки теста",
            );
        }
    },
);

export const createTest = createAsyncThunk(
    "tests/create",
    async (testData: CreateTestData, { rejectWithValue }) => {
        try {
            const response = await fetch(createApiUrl(API_ENDPOINTS.tests.create), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(testData),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || "Ошибка при создании теста");
            }

            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка при создании теста",
            );
        }
    },
);

// Создание слайса
const testsSlice = createSlice({
    name: "test",
    initialState,
    reducers: {
        // Дополнительные редьюсеры, если нужны
        clearTests: (state) => {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTests.fulfilled, (state, action: PayloadAction<Test[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(getTests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(createTest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTest.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
                state.error = null;
            })
            .addCase(createTest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(getTestById.pending, (state) => {
                state.selectedLoading = true;
                state.error = null;
            })
            .addCase(getTestById.fulfilled, (state, action: PayloadAction<Test>) => {
                state.selectedLoading = false;
                state.selectedTest = action.payload;
                state.error = null;
            })
            .addCase(getTestById.rejected, (state, action) => {
                state.selectedLoading = false;
                state.error = action.payload as string;
            });
    },
});

// Экспорт действий и редьюсера
export const { clearTests } = testsSlice.actions;
export const selectTest = (state: RootState) => state.test;
export default testsSlice.reducer;
