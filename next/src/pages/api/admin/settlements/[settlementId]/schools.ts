import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { settlementId } = req.query;

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
                `${API_URL}/api/admin/settlements/${settlementId}/schools`,
                {
                    method: "GET",
                    headers,
                },
            );

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
