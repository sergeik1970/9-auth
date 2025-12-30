import { NextApiRequest, NextApiResponse } from "next";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL;
if (!API_INTERNAL_URL) throw new Error("API_INTERNAL_URL is not set");

const createApiUrl = (path: string) => `${API_INTERNAL_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("\n=== GRADING-CRITERIA HANDLER ===");
    console.log("Method:", req.method);
    console.log("Cookies:", Object.keys(req.cookies));
    console.log("UserId cookie:", req.cookies.userId);

    const userId = req.cookies.userId;

    if (!userId) {
        console.log("❌ NO USERID - returning 401");
        return res.status(401).json({ error: "UserId не найден" });
    }

    if (req.method === "PATCH") {
        try {
            console.log("Updating grading criteria for userId:", userId);
            console.log("Body:", JSON.stringify(req.body));

            const response = await fetch(createApiUrl("/api/auth/grading-criteria"), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...req.body,
                    userId,
                }),
            });

            const data = await response.json();
            console.log("Backend response status:", response.status);

            if (!response.ok) {
                console.log("Backend error:", data);
                return res.status(response.status).json(data);
            }

            console.log("✅ Success");
            return res.status(200).json(data);
        } catch (error) {
            console.error("Error updating grading criteria:", error);
            return res.status(500).json({
                error: "Failed to update grading criteria",
            });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
