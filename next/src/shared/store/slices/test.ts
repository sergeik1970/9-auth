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
    activeAttempts: Array<{ id: number; testId: number; test: Test; startedAt: Date }>;
    activeAttemptsLoading: boolean;
    testAttempts: any[];
    testAttemptsLoading: boolean;
}

// Начальное состояние
const initialState: TestsState = {
    items: [],
    loading: false,
    error: null,
    selectedTest: null,
    selectedLoading: false,
    activeAttempts: [],
    activeAttemptsLoading: false,
    testAttempts: [],
    testAttemptsLoading: false,
};

// Создание асинхронного thunk для получения тестов
export const getTests = createAsyncThunk("tests/getTests", async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(createApiUrl("/api/tests"), {
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`Ошибка при загрузке тестов: ${response.status}`);
        }

        const data = await response.json();
        return data as Test[];
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : "Ошибка загрузки тестов");
    }
});

export const getAvailableTests = createAsyncThunk(
    "tests/getAvailableTests",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(createApiUrl("/api/tests/available"), {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Ошибка при загрузке доступных тестов: ${response.status}`);
            }

            const data = await response.json();
            return data as Test[];
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка загрузки доступных тестов",
            );
        }
    },
);

export const getTestById = createAsyncThunk(
    "tests/getTestById",
    async (id: number, { rejectWithValue }) => {
        try {
            // Добавляем timestamp для обхода кэша
            const url = `${createApiUrl(API_ENDPOINTS.tests.getById(id))}?t=${Date.now()}`;
            const response = await fetch(url, {
                credentials: "include",
                cache: "no-store",
            });

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
            const cleanedData = {
                ...testData,
                questions: testData.questions.map((question) => ({
                    ...question,
                    options: question.options
                        ? question.options.filter((option) => option.text.trim() !== "")
                        : question.options,
                })),
            };

            const response = await fetch(createApiUrl(API_ENDPOINTS.tests.create), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(cleanedData),
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

export const updateTest = createAsyncThunk(
    "tests/update",
    async (
        { testId, testData }: { testId: number; testData: CreateTestData },
        { rejectWithValue },
    ) => {
        try {
            const cleanedData = {
                ...testData,
                questions: testData.questions.map((question) => ({
                    ...question,
                    options: question.options
                        ? question.options.filter((option) => option.text.trim() !== "")
                        : question.options,
                })),
            };

            const response = await fetch(`/api/tests/${testId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(cleanedData),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || data.error || "Ошибка при обновлении теста");
            }

            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка при обновлении теста",
            );
        }
    },
);

export const autoSaveTest = createAsyncThunk(
    "tests/autoSave",
    async (
        { testId, testData }: { testId: number; testData: CreateTestData },
        { rejectWithValue },
    ) => {
        try {
            const cleanedData = {
                ...testData,
                questions: testData.questions.map((question) => ({
                    ...question,
                    options: question.options
                        ? question.options.filter((option) => option.text.trim() !== "")
                        : question.options,
                })),
            };

            const response = await fetch(`/api/tests/${testId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(cleanedData),
            });

            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.message || data.error || "Ошибка при автосохранении");
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка при автосохранении",
            );
        }
    },
);

export const saveTestAsDraft = createAsyncThunk(
    "tests/saveAsDraft",
    async (
        { testId, testData }: { testId: number; testData: CreateTestData },
        { rejectWithValue },
    ) => {
        try {
            const cleanedData = {
                ...testData,
                status: "draft",
                questions: testData.questions.map((question) => ({
                    ...question,
                    options: question.options
                        ? question.options.filter((option) => option.text.trim() !== "")
                        : question.options,
                })),
            };

            const response = await fetch(`/api/tests/${testId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(cleanedData),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(
                    data.message || data.error || "Ошибка при сохранении черновика",
                );
            }

            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка при сохранении черновика",
            );
        }
    },
);

export const getTestAttempts = createAsyncThunk(
    "tests/getTestAttempts",
    async (testId: number, { rejectWithValue }) => {
        try {
            const response = await fetch(createApiUrl(API_ENDPOINTS.tests.getAttempts(testId)), {
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Ошибка при загрузке результатов: ${response.status} - ${
                        errorData.details || errorData.error || ""
                    }`,
                );
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка загрузки результатов теста",
            );
        }
    },
);

export const getActiveAttempts = createAsyncThunk(
    "tests/getActiveAttempts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch("/api/tests/active-attempts", {
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Ошибка при загрузке активных попыток: ${response.status} - ${
                        errorData.details || errorData.error || ""
                    }`,
                );
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка загрузки активных попыток",
            );
        }
    },
);

export const publishTest = createAsyncThunk(
    "tests/publish",
    async (testId: number, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/tests/${testId}/publish`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || data.error || "Ошибка при публикации теста");
            }

            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка при публикации теста",
            );
        }
    },
);

export const completeTest = createAsyncThunk(
    "tests/complete",
    async (testId: number, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/tests/${testId}/complete`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || data.error || "Ошибка при завершении теста");
            }

            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка при завершении теста",
            );
        }
    },
);

export const archiveTest = createAsyncThunk(
    "tests/archive",
    async (testId: number, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/tests/${testId}/archive`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(
                    data.message || data.error || "Ошибка при архивировании теста",
                );
            }

            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка при архивировании теста",
            );
        }
    },
);

export const recalculateAttempts = createAsyncThunk(
    "tests/recalculate",
    async (
        { testId, timeRangeHours }: { testId: number; timeRangeHours: number },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`/api/tests/${testId}/recalculate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ timeRangeHours }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(
                    data.message || data.error || "Ошибка при перепроверке попыток",
                );
            }

            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Ошибка при перепроверке попыток",
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
            })
            .addCase(getAvailableTests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAvailableTests.fulfilled, (state, action: PayloadAction<Test[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(getAvailableTests.rejected, (state, action) => {
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
            .addCase(updateTest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTest.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex((test) => test.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedTest && state.selectedTest.id === action.payload.id) {
                    state.selectedTest = action.payload;
                }
                state.error = null;
            })
            .addCase(updateTest.rejected, (state, action) => {
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
                state.selectedTest = null;
                state.error = action.payload as string;
            });
        builder
            .addCase(getActiveAttempts.pending, (state) => {
                state.activeAttemptsLoading = true;
            })
            .addCase(getActiveAttempts.fulfilled, (state, action: PayloadAction<any>) => {
                state.activeAttemptsLoading = false;
                state.activeAttempts = action.payload;
            })
            .addCase(getActiveAttempts.rejected, (state) => {
                state.activeAttemptsLoading = false;
                state.activeAttempts = [];
            });
        builder
            .addCase(getTestAttempts.pending, (state) => {
                state.testAttemptsLoading = true;
            })
            .addCase(getTestAttempts.fulfilled, (state, action: PayloadAction<any>) => {
                state.testAttemptsLoading = false;
                state.testAttempts = action.payload;
            })
            .addCase(getTestAttempts.rejected, (state) => {
                state.testAttemptsLoading = false;
                state.testAttempts = [];
            });
        builder
            .addCase(publishTest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(publishTest.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex((test) => test.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedTest && state.selectedTest.id === action.payload.id) {
                    state.selectedTest = action.payload;
                }
                state.error = null;
            })
            .addCase(publishTest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(completeTest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(completeTest.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex((test) => test.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedTest && state.selectedTest.id === action.payload.id) {
                    state.selectedTest = action.payload;
                }
                state.error = null;
            })
            .addCase(completeTest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(archiveTest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(archiveTest.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex((test) => test.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedTest && state.selectedTest.id === action.payload.id) {
                    state.selectedTest = action.payload;
                }
                state.error = null;
            })
            .addCase(archiveTest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(recalculateAttempts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(recalculateAttempts.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(recalculateAttempts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

// Экспорт действий и редьюсера
export const { clearTests } = testsSlice.actions;
export const selectTest = (state: RootState) => state.test;
export default testsSlice.reducer;
