import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { testId } = req.query;

    if (!testId || typeof testId !== "string") {
        return res.status(400).json({ error: "Invalid test ID" });
    }

    const token = req.cookies.token;
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Cookie = `token=${token}`;
    }

    if (req.method === "GET") {
        try {
            const response = await fetch(`${API_URL}/api/tests/${testId}`, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            res.status(response.status).json(data);
        } catch (error) {
            console.error("Error fetching test:", error);
            res.status(500).json({ error: "Failed to fetch test" });
        }
    } else if (req.method === "PATCH") {
        try {
            console.log("PATCH request to update test:", testId, req.body);
            const response = await fetch(`${API_URL}/api/tests/${testId}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(req.body),
            });

            console.log("Backend response status:", response.status);
            if (!response.ok) {
                const error = await response.json();
                console.log("Backend error response:", error);
                throw new Error(error.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Backend response data:", data);
            res.status(response.status).json(data);
        } catch (error) {
            console.error("Error updating test:", error);
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to update test",
            });
        }
    } else if (req.method === "DELETE") {
        try {
            const response = await fetch(`${API_URL}/api/tests/${testId}`, {
                method: "DELETE",
                headers,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `API error: ${response.status}`);
            }

            res.status(204).end();
        } catch (error) {
            console.error("Error deleting test:", error);
            res.status(500).json({
                error: error instanceof Error ? error.message : "Failed to delete test",
            });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
