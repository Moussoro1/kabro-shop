"use client";

import { useState, useEffect, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ArrowLeft, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { signIn, subscribeToAuthState } from "@/lib/auth";

export default function AdminLoginPage(): ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Si l'utilisateur est déjà connecté, rediriger vers /admin/products
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      if (user) {
        router.replace("/admin/products");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signIn(values.email, values.password);
      router.replace("/admin/products");
    } catch (error: unknown) {
      setIsSubmitting(false);
      const message =
        error instanceof Error
          ? error.message
          : "Échec de l'authentification. Veuillez vérifier vos identifiants.";
      setAuthError(message);
    }
  };

  return (
    <div
      id="admin-login-page"
      className="min-h-screen bg-paper text-charcoal flex flex-col justify-between p-4 sm:p-6"
    >
      {/* Haut de page avec retour boutique */}
      <div className="max-w-md w-full mx-auto">
        <Link
          href="/"
          id="admin-login-back-to-shop"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-charcoal/70 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la boutique</span>
        </Link>
      </div>

      {/* Formulaire de connexion façon ticket */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded [border-radius:4px] bg-primary text-paper flex items-center justify-center font-display font-extrabold text-2xl mx-auto mb-3 shadow-sm">
            B
          </div>
          <h1 className="font-display text-2xl font-extrabold text-charcoal tracking-tight">
            Espace Administrateur
          </h1>
          <p className="text-xs text-charcoal/70 font-body mt-1">
            Connexion réservée aux gestionnaires de la boutique
          </p>
        </div>

        {authError && (
          <div
            id="admin-login-error-banner"
            className="mb-5 p-3.5 bg-danger/10 border border-danger text-danger rounded [border-radius:4px] text-xs font-body"
          >
            <p className="font-semibold mb-0.5">Accès refusé</p>
            <p>{authError}</p>
          </div>
        )}

        <div className="relative bg-paper border border-sand rounded [border-radius:4px] p-6 sm:p-7 overflow-hidden shadow-sm">
          {/* Coin perforé ticket */}
          <div
            className="absolute -top-3 left-6 w-6 h-6 rounded-full bg-paper border-b border-sand z-10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="border-b border-dashed border-sand pb-4 mb-5 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60">
              Session Sécurisée
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-primary bg-sand/30 px-2 py-0.5 rounded [border-radius:2px]">
              <Lock className="w-3 h-3" />
              <span>Firebase Auth</span>
            </div>
          </div>

          <form
            id="admin-login-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {/* Champ Email */}
            <div>
              <label
                htmlFor="admin-email-input"
                className="block font-mono text-xs uppercase font-medium text-charcoal mb-1.5"
              >
                Adresse email
              </label>
              <input
                id="admin-email-input"
                type="email"
                placeholder="admin@boutique.com"
                {...register("email")}
                className={`w-full px-3.5 py-2.5 bg-paper border rounded [border-radius:2px] text-sm text-charcoal placeholder:text-charcoal/40 font-mono focus:outline-none focus:border-primary transition-colors ${
                  errors.email ? "border-danger" : "border-sand"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label
                htmlFor="admin-password-input"
                className="block font-mono text-xs uppercase font-medium text-charcoal mb-1.5"
              >
                Mot de passe
              </label>
              <input
                id="admin-password-input"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={`w-full px-3.5 py-2.5 bg-paper border rounded [border-radius:2px] text-sm text-charcoal placeholder:text-charcoal/40 font-mono focus:outline-none focus:border-primary transition-colors ${
                  errors.password ? "border-danger" : "border-sand"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-danger font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="admin-login-submit-btn"
              className="w-full mt-2 py-3 px-5 bg-accent text-charcoal font-bold text-sm rounded [border-radius:2px] inline-flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-dashed border-sand text-center text-xs text-charcoal/60 font-body">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Accès réservé aux administrateurs autorisés</span>
            </div>
            <p className="text-[11px] text-charcoal/50">
              Les comptes gestionnaires sont configurés directement dans la console Firebase.
            </p>
          </div>
        </div>
      </div>

      {/* Footer sobre */}
      <div className="text-center text-[11px] font-mono text-charcoal/40 py-2">
        Boutique Marché — Administration & Sécurité
      </div>
    </div>
  );
}
