import type { NextApiRequest, NextApiResponse } from "next";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL;
if (!API_INTERNAL_URL) throw new Error("API_INTERNAL_URL is not set");

const createApiUrl = (path: string) => `${API_INTERNAL_URL}${path}`;

function parseCookiesFromRequest(req: NextApiRequest): Record<string, string> {
    const cookieHeader = req.headers.cookie || "";
    const cookies: Record<string, string> = {};

    cookieHeader.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name && value) {
            cookies[name] = decodeURIComponent(value);
        }
    });

    return cookies;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("=== Active Attempts API Route ===");
    console.log("Method:", req.method);
    console.log("Raw Cookie header:", req.headers.cookie);

    if (req.method === "GET") {
        try {
            const cookies = parseCookiesFromRequest(req);
            const token = cookies.token;
            console.log(
                "Token found:",
                !!token,
                "Value:",
                token ? token.substring(0, 20) + "..." : "none",
            );

            if (!token) {
                console.log("No token found, returning 401");
                return res.status(401).json({ error: "Unauthorized: No token provided" });
            }

            const headers: HeadersInit = {
                "Content-Type": "application/json",
                Cookie: `token=${token}`,
            };

            const backendUrl = createApiUrl("/api/tests/active-attempts");
            console.log("Fetching from backend:", backendUrl);
            const response = await fetch(backendUrl, {
                method: "GET",
                headers,
            });

            console.log("Backend response status:", response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend error text:", errorText);
                res.status(response.status).json({
                    error: `Backend error: ${response.status}`,
                    details: errorText,
                });
                return;
            }

            const data = await response.json();
            console.log("Active attempts count:", data.length);
            res.status(response.status).json(data);
        } catch (error) {
            console.error("Error fetching active attempts:", error);
            res.status(500).json({ error: "Failed to fetch active attempts" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
