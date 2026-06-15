// components/AvatarModal.tsx
import React, { useEffect } from "react";

interface AvatarModalProps {
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    modalUser: string | null;
    userAvatars: { [key: string]: string };
    avatarOptions: string[];
    changeAvatar: (newAvatarSeed: string) => void;
    user: string;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
    showModal,
    setShowModal,
    modalUser,
    userAvatars,
    avatarOptions,
    changeAvatar,
    user,
}) => {
    useEffect(() => {
        if (!showModal) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowModal(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showModal, setShowModal]);

    if (!showModal || !modalUser) return null;
    const isSelf = modalUser === user;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                onClick={() => setShowModal(false)}
            />
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl p-6 shadow-xl">
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                    </svg>
                </button>
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-violet-500 mb-3">
                        <img
                            src={`https://api.dicebear.com/6.x/personas/svg?seed=${userAvatars[modalUser]}`}
                            alt={modalUser}
                            className="w-full h-full rounded-full bg-white"
                        />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {modalUser}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        {isSelf ? "This is you" : "Chat participant"}
                    </p>

                    {isSelf && (
                        <div className="w-full">
                            <h3 className="text-xs uppercase tracking-wide font-medium mb-2 text-slate-500 dark:text-slate-400 text-center">
                                Choose your avatar
                            </h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {avatarOptions.map((avatarSeed) => {
                                    const active = userAvatars[user] === avatarSeed;
                                    return (
                                        <button
                                            key={avatarSeed}
                                            onClick={() => changeAvatar(avatarSeed)}
                                            className={`rounded-full p-0.5 transition ${
                                                active
                                                    ? "ring-2 ring-indigo-500 bg-gradient-to-br from-indigo-500/20 to-violet-500/20"
                                                    : "ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-indigo-400"
                                            }`}
                                        >
                                            <img
                                                src={`https://api.dicebear.com/6.x/personas/svg?seed=${avatarSeed}`}
                                                alt={avatarSeed}
                                                className="w-14 h-14 rounded-full bg-white"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AvatarModal;
