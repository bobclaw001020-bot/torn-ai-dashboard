import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <p className="muted text-sm">Private family dashboard</p>
        <h1 className="mb-6 mt-1 text-2xl font-bold">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
