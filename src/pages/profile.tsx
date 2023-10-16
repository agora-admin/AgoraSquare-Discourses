import UserProfile from "@/components/dialogs/UserProfile";
import TopBar from "@/components/topbar/TopBar";
import React from "react";

export const ProfilePage = () => {
	return (
		<>
			<TopBar onDiscoursePage={false} />
			<UserProfile />
		</>
	);
};

export default ProfilePage;
