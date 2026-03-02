import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MaskImage from "../components/MaskImage";

export default function ThankYou() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const formName = searchParams.get('formName') || 'Form';
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (countdown === 0) {
            // Optionally redirect to home or close window
            // navigate('/');
        }
    }, [countdown, navigate]);

    return (
        <div className="min-h-screen bg-[var(--body-back)] flex items-center justify-center py-8 px-4">
            <div className="max-w-2xl mx-auto w-full">
                <div className="bg-[var(--bg-w)] rounded-[12px] shadow-[0px_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_20px_rgba(0,0,0,0.3)] border border-[var(--border)] p-8 text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-600 dark:text-green-400">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h1 className="text-[var(--text-dark)] text-[2em] font-bold mb-3">Thank You!</h1>
                        <p className="text-[var(--text-dark)] text-[1.1em] opacity-75">
                            Your response has been submitted successfully.
                        </p>
                        {formName && formName !== 'Form' && (
                            <p className="text-[var(--text-dark)] text-[.95em] opacity-60 mt-2">
                                We've received your submission for <strong>{formName}</strong>
                            </p>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--border)]">
                        <p className="text-[var(--text-2)] text-[.85em] flex items-center justify-center gap-1">
                            <span>POWERED BY</span>
                            <span className="flex items-center gap-1">
                                <MaskImage url="/icons/link.svg" w="1em" h="1em" bg="var(--text-2)" />
                                <span className="font-semibold">ClickMyChat</span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
