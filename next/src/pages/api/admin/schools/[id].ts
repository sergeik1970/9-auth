import type { NextApiRequest, NextApiResponse } from "next";

const createApiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const token = req.cookies.token;
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Cookie = `token=${token}`;
    }

    if (req.method === "GET") {
        try {
            const response = await fetch(createApiUrl(`/api/admin/schools/${id}`), {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                return res.status(response.status).json({ error: "Failed to fetch school" });
            }

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching school:", error);
            res.status(500).json({ error: "Failed to fetch school" });
        }
    } else if (req.method === "PUT") {
        try {
            const response = await fetch(createApiUrl(`/api/admin/schools/${id}`), {
                method: "PUT",
                headers,
                body: JSON.stringify(req.body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return res
                    .status(response.status)
                    .json(errorData || { error: "Failed to update school" });
            }

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error("Error updating school:", error);
            res.status(500).json({ error: "Failed to update school" });
        }
    } else if (req.method === "DELETE") {
        try {
            const response = await fetch(createApiUrl(`/api/admin/schools/${id}`), {
                method: "DELETE",
                headers,
            });

            if (!response.ok) {
                return res.status(response.status).json({ error: "Failed to delete school" });
            }

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error("Error deleting school:", error);
            res.status(500).json({ error: "Failed to delete school" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
