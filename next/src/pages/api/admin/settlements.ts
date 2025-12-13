import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = req.cookies.token;
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Cookie = `token=${token}`;
    }

    if (req.method === "GET") {
        try {
            const response = await fetch(`${API_URL}/api/admin/settlements`, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                return res.status(response.status).json({ error: "Failed to fetch settlements" });
            }

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching settlements:", error);
            res.status(500).json({ error: "Failed to fetch settlements" });
        }
    } else if (req.method === "POST") {
        try {
            const response = await fetch(`${API_URL}/api/admin/settlements`, {
                method: "POST",
                headers,
                body: JSON.stringify(req.body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return res
                    .status(response.status)
                    .json(errorData || { error: "Failed to create settlement" });
            }

            const data = await response.json();
            res.status(201).json(data);
        } catch (error) {
            console.error("Error creating settlement:", error);
            res.status(500).json({ error: "Failed to create settlement" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
