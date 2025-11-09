import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { testId, attemptId } = req.query;

    if (!testId || typeof testId !== "string" || !attemptId || typeof attemptId !== "string") {
        return res.status(400).json({ error: "Invalid test ID or attempt ID" });
    }

    if (req.method === "GET") {
        try {
            const token = req.cookies.token;
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers.Cookie = `token=${token}`;
            }

            const response = await fetch(
                `${API_URL}/api/tests/${testId}/attempts/${attemptId}/results`,
                {
                    method: "GET",
                    headers,
                },
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            res.status(response.status).json(data);
        } catch (error) {
            console.error("Error fetching results:", error);
            res.status(500).json({ error: "Failed to fetch results" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
