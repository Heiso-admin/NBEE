import { auth } from "@heiso/core/modules/auth/auth.config";
import { redirect } from "next/navigation";
import { getAccountByEmail } from "@heiso/core/lib/platform/account-adapter";
import AuthenticationForm from "./authentication-form";

export default async function AuthenticationPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await getAccountByEmail(session.user.email);

    const loginMethod = user?.loginMethod || "email";

    return <AuthenticationForm loginMethod={loginMethod} />;
}
