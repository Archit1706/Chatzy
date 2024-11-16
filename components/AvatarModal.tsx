// components/AvatarModal.tsx
import React from "react";

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
    if (!showModal || !modalUser) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={() => setShowModal(false)}
            ></div>
            {/* Modal Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 z-10 max-w-md w-full">
                <div className="flex flex-col items-center">
                    <img
                        src={`https://api.dicebear.com/6.x/personas/svg?seed=${userAvatars[modalUser]}`}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full mb-4"
                    />
                    <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">
                        {modalUser}
                    </h2>
                    {/* Mock information */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        This is some mock information about {modalUser}.
                    </p>
                    {modalUser === user && (
                        <div className="w-full">
                            <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                                Choose your avatar
                            </h3>
                            <div className="flex space-x-4">
                                {avatarOptions.map((avatarSeed) => (
                                    <img
                                        key={avatarSeed}
                                        src={`https://api.dicebear.com/6.x/personas/svg?seed=${avatarSeed}`}
                                        alt="Avatar Option"
                                        className="w-16 h-16 rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500"
                                        onClick={() => changeAvatar(avatarSeed)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setShowModal(false)}
                        className="mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarModal;
