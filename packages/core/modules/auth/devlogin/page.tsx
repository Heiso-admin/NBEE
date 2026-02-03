"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@heiso/core/components/ui/button";
import { Input } from "@heiso/core/components/ui/input";
import { Label } from "@heiso/core/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@heiso/core/components/ui/card";
import { useRouter } from "next/navigation";
import { checkAdminStatus, updateAdminPassword, ensureDevUser } from "./actions";
import Header from "../_components/header";


export default function DevLoginPage() {
    const [step, setStep] = useState<'login' | 'prompt'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialChecking, setInitialChecking] = useState(true); // New state for initial check
    const [error, setError] = useState('');
    const router = useRouter();

    // Auto-check status on mount
    useEffect(() => {
        const initCheck = async () => {
            // In Dev Login, we prioritize checking the Core PM account status first
            const result = await checkAdminStatus('pm@heiso.io');
            if (result.lastLoginAt === null) {
                // User missing -> Go straight to Prompt
                setEmail('pm@heiso.io');
                setStep('prompt');
            } else {
                // User exists or error -> Stay on Login
                // Optional: pre-fill email for convenience?
                // setEmail('pm@heiso.io'); 
            }
            setInitialChecking(false);
        };
        initCheck();
    }, []);

    const handleLoginCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await checkAdminStatus(email);
        setLoading(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        if (result.lastLoginAt === null) {
            setStep('prompt');
        } else {
            // Normal Login
            doSignIn();
        }
    };

    const doSignIn = async () => {
        setLoading(true);

        // Pre-check / Auto-create for Dev Login
        if (email === 'pm@heiso.io') {
            const checkResult = await ensureDevUser(email, password);
            if (checkResult.error) {
                setError(checkResult.error);
                setLoading(false);
                return;
            }
        }

        const result = await signIn("credentials", {
            username: email, // auth.config uses 'username' field
            password: password,
            isDevLogin: "true",
            redirect: false,
        });

        if (result?.error) {
            setError("Login failed: " + result.error);
            setLoading(false);
        } else {
            router.push('/'); // Go to dashboard
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        const result = await updateAdminPassword(email, newPassword);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // Use new password to sign in
            const loginResult = await signIn("credentials", {
                username: email,
                password: newPassword,
                isDevLogin: "true",
                redirect: false,
            });
            if (loginResult?.error) {
                setError("Password updated but login failed.");
                setLoading(false);
            } else {
                router.push('/');
            }
        }
    };

    if (initialChecking) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <Header
                title="Dev Login Channel"
                description="Internal Admin Access Only"
            />

            <div className="mt-8">
                {step === 'login' && (
                    <form onSubmit={handleLoginCheck} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">Email</Label>
                            <Input
                                id="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@heiso.io"
                                className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all rounded-xl"
                            />
                        </div>
                        {error && <p className="text-destructive text-sm font-medium ml-1">{error}</p>}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary-rgb),0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
                                disabled={loading}
                            >
                                {loading ? "Checking..." : "Login"}
                            </Button>
                        </div>
                    </form>
                )}

                {step === 'prompt' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-sm font-medium leading-relaxed">
                            <span className="block mb-1 font-bold">First Time Setup</span>
                            Please set a secure password for the Core Project Manager account (pm@heiso.io).
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={e => {
                                    const val = e.target.value;
                                    setNewPassword(val);
                                    if (error === "Passwords do not match") {
                                        if (val === confirmPassword) setError('');
                                    } else {
                                        setError('');
                                    }
                                }}
                                className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={e => {
                                    const val = e.target.value;
                                    setConfirmPassword(val);
                                    if (error === "Passwords do not match") {
                                        if (val === newPassword) setError('');
                                    } else {
                                        setError('');
                                    }
                                }}
                                className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all rounded-xl"
                            />
                        </div>

                        {error && <p className="text-destructive text-sm font-medium ml-1">{error}</p>}

                        <div className="flex gap-4 pt-2">
                            {/* Skip button removed for Core Mode */}
                            <Button
                                className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary-rgb),0.4)] transition-all duration-300"
                                onClick={handleUpdatePassword}
                                disabled={!newPassword || !confirmPassword || loading}
                            >
                                Create Account & Login
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
