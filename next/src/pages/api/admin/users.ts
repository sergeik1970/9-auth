import type { NextApiRequest, NextApiResponse } from "next";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL;
if (!API_INTERNAL_URL) throw new Error("API_INTERNAL_URL is not set");

const createApiUrl = (path: string) => `${API_INTERNAL_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const token = req.cookies.token;
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers.Cookie = `token=${token}`;
            }

            const response = await fetch(createApiUrl("/api/admin/users"), {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                return res.status(response.status).json({ error: "Failed to fetch users" });
            }

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Failed to fetch users" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
