import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Test } from "@/shared/types/test";
import { createApiUrl, API_ENDPOINTS } from "@/shared/config/api";

// Определение типа состояния
interface TestsState {
    items: Test[];
    loading: boolean;
    error: string | null;
}

// Начальное состояние
const initialState: TestsState = {
    items: [],
    loading: false,
    error: null,
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
    },
});

// Экспорт действий и редьюсера
export const { clearTests } = testsSlice.actions;
export default testsSlice.reducer;
