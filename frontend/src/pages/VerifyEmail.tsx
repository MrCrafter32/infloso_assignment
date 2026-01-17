import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/services/auth.api";
import { motion } from "framer-motion";

export default function VerifyEmail() {
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || "";

    if (!token) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md bg-[#181818] p-8 rounded-xl shadow-lg"
                >
                    <h1 className="text-white text-2xl font-semibold text-center mb-6">
                        Invalid Verification Link
                    </h1>
                    <div className="text-gray-400 text-center">
                        The verification link is missing a token. Please check your email for the correct link.
                    </div>
                </motion.div>
            </div>
        );
    }

    useEffect(() => {
        if (!verified && !error) return;

        const timeoutId = window.setTimeout(() => {
            navigate("/");
        }, 2000);

        return () => window.clearTimeout(timeoutId);
    }, [verified, error, navigate]);

    const handleVerify = async () => {
        setLoading(true);
        setError(null);
        try {
            await verifyEmail(token);
            setVerified(true);
        } catch (err: any) {
            setError(err.error || "Verification failed");
        }   finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md bg-[#181818] p-8 rounded-xl shadow-lg"
            >
                <h1 className="text-white text-2xl font-semibold text-center mb-6">
                    Verify Your Email
                </h1>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center"
                    >
                        <div className="text-sm font-medium text-red-400">
                            We couldn't verify your email.
                        </div>
                        <div className="mt-1 text-xs text-red-400/80">
                            {error}
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                            Redirecting to home in 2 seconds...
                        </div>
                    </motion.div>
                )}

                {verified ? (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-center"
                    >
                        <div className="text-sm font-medium text-green-400">
                            Email verified successfully!
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                            Redirecting to home in 2 seconds...
                        </div>
                    </motion.div>
                ) : (
                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading && (
                            <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                        )}
                        <span>{loading ? "Verifying..." : "Verify Email"}</span>
                    </button>
                )}
            </motion.div>
        </div>
    )
}