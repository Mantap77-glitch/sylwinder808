import { getAdminSession } from "@/lib/auth/admin-session";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default async function ChangePasswordPage() {
  const session = await getAdminSession();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">
          Change Password
        </h1>
      </section>

      <ChangePasswordForm />
    </div>
  );
}