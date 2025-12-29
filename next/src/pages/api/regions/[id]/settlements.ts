import type { NextApiRequest, NextApiResponse } from "next";

const createApiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Region ID is required" });
    }

    if (req.method === "GET") {
        try {
            const response = await fetch(createApiUrl(`/api/regions/${id}/settlements`), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
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
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
