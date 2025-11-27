import { NextApiRequest, NextApiResponse } from "next";

const createApiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            console.log("\n=== LOGIN PROXY ===");
            const response = await fetch(createApiUrl("/api/auth/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(req.body),
            });

            const data = await response.json();
            console.log("Backend response status:", response.status);
            console.log("Backend response headers:", response.headers);

            if (!response.ok) {
                return res.status(response.status).json(data);
            }

            const setCookieHeaders = response.headers.getSetCookie?.() || [];
            console.log("Set-Cookie headers from backend:", setCookieHeaders);

            if (setCookieHeaders.length > 0) {
                console.log("✅ Setting cookies on client response");
                res.setHeader("set-cookie", setCookieHeaders);
            } else {
                console.log("❌ No Set-Cookie headers found");
            }

            return res.status(200).json(data);
        } catch (error) {
            console.error("Error during login:", error);
            return res.status(500).json({ error: "Failed to login" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
