import { LogOut, Microscope, Sprout } from "lucide-react";
import { Button } from "@components/ui/button";
import ThemeToggle from "@components/theme-toggle";
import { Fragment, useEffect, useState } from "react";
import AuthModal from "@components/auth/auth-modal";
import LoginCard from "@components/auth/login-card";
import RegisterCard from "@components/auth/register-card";
import { useAuth } from "@providers/auth-provider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import API from "@lib/axios-wrapper";
import { getApiErrorMessage } from "@lib/api-error";
import globalEventEmitter from "@lib/event-emitter";
import { useNavigate } from "react-router";

export default function SiteHeader() {
  const [modal, setModal] = useState<"login" | "register" | null>(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // close the modal once the login / register card reports success
  useEffect(() => {
    const closeModal = () => setModal(null);
    globalEventEmitter.addEventListener("login", closeModal);
    globalEventEmitter.addEventListener("register", closeModal);
    return () => {
      globalEventEmitter.removeEventListener("login", closeModal);
      globalEventEmitter.removeEventListener("register", closeModal);
    };
  }, []);

  const logoutMutation = useMutation({
    mutationFn: () => API.post("/auth/logout"),
    onSuccess: () => {
      setUser(null);
      toast.success("Logged out successfully", { position: "top-right" });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Logout failed."), {
        position: "top-right",
      });
    },
  });

  return (
    <Fragment>
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-border/30 bg-background/90 px-4 py-2 backdrop-blur-md md:px-12">
        <div
          className="flex items-center gap-6"
          onMouseUp={() => {
            navigate("/");
          }}
        >
          <a href="#" className="group flex items-center gap-2">
            <Sprout className="size-6 fill-primary/20 text-primary transition-transform group-hover:scale-105" />
            <span className="font-stitch-headline text-stitch-headline-md font-medium tracking-tight text-primary">
              Plant Protection Assistant
            </span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!user && (
            <Fragment>
              <Button
                variant="outline"
                onClick={() => setModal("login")}
                className="hidden cursor-pointer font-stitch-body sm:inline-flex"
              >
                Log In
              </Button>
              <Button
                onClick={() => setModal("register")}
                className="cursor-pointer font-stitch-body"
              >
                <Microscope />
                Sign Up
              </Button>
            </Fragment>
          )}
          {user && (
            <Fragment>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="cursor-pointer font-stitch-body"
              >
                <LogOut />
                Log Out
              </Button>
            </Fragment>
          )}
        </div>
      </header>
      {modal && (
        <AuthModal
          label={modal === "login" ? "Log in" : "Sign up"}
          onClose={() => setModal(null)}
        >
          {modal === "login" ? <LoginCard /> : <RegisterCard />}
        </AuthModal>
      )}
    </Fragment>
  );
}
