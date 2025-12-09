import { NextApiRequest, NextApiResponse } from "next";

const createApiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("profile - incoming request");
    console.log("profile - cookies:", req.cookies);

    const token = req.cookies.token;

    if (!token) {
        console.log("profile - no token in cookies");
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "PATCH") {
        try {
            const response = await fetch(createApiUrl("/api/auth/profile"), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(req.body),
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            const setCookieHeader = response.headers.get("set-cookie");
            if (setCookieHeader) {
                res.setHeader("Set-Cookie", setCookieHeader);
            }

            return res.status(200).json(data);
        } catch (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ error: "Failed to update profile" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
