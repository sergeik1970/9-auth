import { NextApiRequest, NextApiResponse } from "next";

const createApiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            console.log("\n=== ME HANDLER ===");
            console.log("All cookies object:", req.cookies);
            console.log("Cookie keys:", Object.keys(req.cookies));
            console.log("Headers:", req.headers);

            let token = req.cookies.token;
            console.log("Token from cookie:", token ? "YES" : "NO");

            if (!token) {
                const authHeader = req.headers.authorization;
                console.log("Auth header:", authHeader);
                if (authHeader?.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            if (!token) {
                console.log("❌ NO TOKEN - returning 401");
                return res.status(401).json({ error: "Unauthorized" });
            }

            console.log("✅ Token found, forwarding to backend");
            console.log("Token length:", token.length);

            const response = await fetch(createApiUrl("/api/auth/me"), {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            console.log("Backend response status:", response.status);

            if (!response.ok) {
                console.log("❌ Backend error:", data);
                return res.status(response.status).json(data);
            }

            console.log("✅ Success - returning user data");
            return res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching current user:", error);
            return res.status(500).json({ error: "Failed to fetch current user" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
