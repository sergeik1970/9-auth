import type { NextApiRequest, NextApiResponse } from "next";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://localhost:3001";

const createApiUrl = (path: string) => `${API_INTERNAL_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Settlement ID is required" });
    }

    if (req.method === "GET") {
        try {
            const response = await fetch(createApiUrl(`/api/regions/settlement/${id}/schools`), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                return res.status(response.status).json({ error: "Failed to fetch schools" });
            }

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching schools:", error);
            res.status(500).json({ error: "Failed to fetch schools" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
