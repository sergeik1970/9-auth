import type { NextApiRequest, NextApiResponse } from "next";

const createApiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

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
            const response = await fetch(createApiUrl("/api/admin/schools"), {
                method: "GET",
                headers,
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
    } else if (req.method === "POST") {
        try {
            const response = await fetch(createApiUrl("/api/admin/schools"), {
                method: "POST",
                headers,
                body: JSON.stringify(req.body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return res
                    .status(response.status)
                    .json(errorData || { error: "Failed to create school" });
            }

            const data = await response.json();
            res.status(201).json(data);
        } catch (error) {
            console.error("Error creating school:", error);
            res.status(500).json({ error: "Failed to create school" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
