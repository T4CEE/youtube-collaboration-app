import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate: loginMutation, isError, isLoading, error } = useMutation({
        mutationFn: async ({ email, password }) => {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to login");
            return data;
        },
        onSuccess: (data) => {
            console.log("Login successful:", data);
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            navigate("/");
        },
        onError: (err) => {
            console.error("Login failed:", err.message);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation(formData);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-screen-xl mx-auto flex h-screen">
            <div className="flex-1 flex flex-col justify-center items-center">
                <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
                    <h1 className="text-4xl font-extrabold text-white">{"Let's"} go.</h1>
                    <label className="input input-bordered rounded flex items-center gap-2">
                        <input
                            type="text"
                            className="grow"
                            placeholder="email"
                            name="email"
                            onChange={handleInputChange}
                            value={formData.email}
                        />
                    </label>
                    <label className="input input-bordered rounded flex items-center gap-2">
                        <input
                            type="password"
                            className="grow"
                            placeholder="Password"
                            name="password"
                            onChange={handleInputChange}
                            value={formData.password}
                        />
                    </label>
                    <button className="btn rounded-full bg-stone-800 text-white">
                        {isLoading ? "Loading..." : "Login"}
                    </button>
                    {isError && <p className="text-red-500">{error.message}</p>}
                </form>
                <div className="flex flex-col gap-2 mt-4">
                    <p className="text-white text-lg">{"Don't"} have an account?</p>
                    <Link to="/signup">
                        <button className="btn rounded-full bg-stone-800 text-white btn-outline w-full">
                            Sign up
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
