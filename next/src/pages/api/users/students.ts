import { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

            const response = await fetch(`${API_URL}/api/users/students`, {
                method: "GET",
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            res.status(response.status).json(data);
        } catch (error) {
            console.error("Error fetching students:", error);
            res.status(500).json({ error: "Failed to fetch students" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
