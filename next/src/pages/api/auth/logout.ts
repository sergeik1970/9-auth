import { NextApiRequest, NextApiResponse } from "next";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL;
if (!API_INTERNAL_URL) throw new Error("API_INTERNAL_URL is not set");

const createApiUrl = (path: string) => `${API_INTERNAL_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            const token = req.cookies.token;

            if (!token) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const response = await fetch(createApiUrl("/api/auth/logout"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            res.setHeader("Set-Cookie", [
                "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;",
                "userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;",
            ]);

            return res.status(200).json(data);
        } catch (error) {
            console.error("Error during logout:", error);
            return res.status(500).json({ error: "Failed to logout" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
