import type { NextApiRequest, NextApiResponse } from "next";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL;
if (!API_INTERNAL_URL) throw new Error("API_INTERNAL_URL is not set");

const createApiUrl = (path: string) => `${API_INTERNAL_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { testId } = req.query;

    if (!testId || typeof testId !== "string") {
        return res.status(400).json({ error: "Invalid test ID" });
    }

    if (req.method === "POST") {
        try {
            const token = req.cookies.token;
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers.Cookie = `token=${token}`;
            }

            const response = await fetch(createApiUrl(`/api/tests/${testId}/recalculate`), {
                method: "POST",
                headers,
                body: JSON.stringify(req.body),
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            res.status(response.status).json(data);
        } catch (error) {
            console.error("Error recalculating attempts:", error);
            res.status(500).json({ error: "Failed to recalculate attempts" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
