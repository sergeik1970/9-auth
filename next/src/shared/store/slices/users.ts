import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface Student {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

interface UsersState {
    students: Student[];
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    students: [],
    loading: false,
    error: null,
};

export const fetchStudents = createAsyncThunk(
    "users/fetchStudents",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch("/api/users/students", {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Error fetching students: ${response.status}`);
            }

            const data = await response.json();
            return data as Student[];
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Failed to fetch students",
            );
        }
    },
);

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.students = action.payload;
                state.error = null;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectUsers = (state: RootState) => state.users;
export default usersSlice.reducer;
