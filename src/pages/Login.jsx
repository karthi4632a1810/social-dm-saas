import "../assets/css/form.css";
import MaskImage from "../components/MaskImage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../utils/api";


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log(email, password)
            const response = await authAPI.login(email, password);

            if (response.success) {
                // Redirect to dashboard
                navigate("/analytics");
            } else {
                setError(response.message || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="login-page" className="flex-1 p-4 w-full text-[16px]">
            <div className="login-card shadow">
                <div className="header-bg relative">
                    <div className="sun"></div>
                    <div className="birds">🕊️ 🕊️</div>
                    <h2 className="text-[white] text-[2em] font-semibold">ClickMyChat</h2>
                    <p>DM link & affiliate management platform</p>
                </div>

                <div className="login-section">
                    <h5>USER LOGIN</h5>

                    {error && (
                        <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-[.85em]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group mb-3 flex">
                            <span className="input-group-text w-[15%] flex justify-center items-center">
                                <MaskImage url="/icons/l-u.svg" w="1.2em" h="1.2em" bg="white" />
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-control w-full py-2"
                                placeholder="Email"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="input-group mb-3 flex">
                            <span className="input-group-text w-[15%] flex justify-center items-center">
                                <MaskImage url="/icons/l-l.svg" w="1.2em" h="1.2em" bg="white" />
                            </span>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control w-full py-2"
                                placeholder="Password"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-btn cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                    <div className="flex mt-5">
                        <p className="text-[--text-dark] text-center w-full opacity-90 text-[.9em]">Don't have an account? <span className="text-[#0f8b8d] font-semibold">Sign up</span> </p>
                    </div>
                    <div className="text-center mt-4 powered-by hidden">
                        <div className="powered-by-inner">
                            <span>Powered by</span>
                            <a href="https://transvaal.in/">
                                <img
                                    src="https://transvaal.in/logo-dark.svg"
                                    alt="LOGO"
                                />
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
